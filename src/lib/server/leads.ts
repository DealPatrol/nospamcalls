import { sqlClient } from './db';

export const LEAD_MAGNETS = [
	'home_blocklist',
	'number_alert',
	'area_code_alert',
	'guide_checklist',
	'blocklist_vcf',
	'tcpa_packet',
	'settlement_alert',
	'optout_kit',
	'gmail_filters',
	'data_index',
	'compare_guide',
	'pro_waitlist'
] as const;
export type LeadMagnet = (typeof LEAD_MAGNETS)[number];

let ready: Promise<void> | null = null;

export function ensureLeadsSchema(): Promise<void> {
	if (!ready) {
		ready = (async () => {
			const sql = sqlClient();
			await sql`CREATE TABLE IF NOT EXISTS email_leads (
				id SERIAL PRIMARY KEY,
				email TEXT NOT NULL,
				source_path TEXT NOT NULL,
				lead_magnet TEXT NOT NULL,
				context_value TEXT,
				pro_interests TEXT[],
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				unsubscribed_at TIMESTAMPTZ,
				welcome_sent_at TIMESTAMPTZ,
				welcome_attempts INTEGER NOT NULL DEFAULT 0,
				last_digest_sent_at TIMESTAMPTZ,
				next_broker_reminder_at TIMESTAMPTZ,
				last_settlement_alert_at TIMESTAMPTZ,
				resend_contact_id TEXT,
				last_email_error TEXT
			)`;
			await sql`CREATE INDEX IF NOT EXISTS email_leads_created_idx ON email_leads (created_at DESC)`;
			await sql`CREATE INDEX IF NOT EXISTS email_leads_magnet_idx ON email_leads (lead_magnet)`;
			await sql`CREATE INDEX IF NOT EXISTS email_leads_email_idx ON email_leads (email)`;
			await sql`ALTER TABLE email_leads ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ`;
			await sql`ALTER TABLE email_leads ADD COLUMN IF NOT EXISTS welcome_sent_at TIMESTAMPTZ`;
			await sql`ALTER TABLE email_leads ADD COLUMN IF NOT EXISTS welcome_attempts INTEGER NOT NULL DEFAULT 0`;
			await sql`ALTER TABLE email_leads ADD COLUMN IF NOT EXISTS last_digest_sent_at TIMESTAMPTZ`;
			await sql`ALTER TABLE email_leads ADD COLUMN IF NOT EXISTS next_broker_reminder_at TIMESTAMPTZ`;
			await sql`ALTER TABLE email_leads ADD COLUMN IF NOT EXISTS last_settlement_alert_at TIMESTAMPTZ`;
			await sql`ALTER TABLE email_leads ADD COLUMN IF NOT EXISTS resend_contact_id TEXT`;
			await sql`ALTER TABLE email_leads ADD COLUMN IF NOT EXISTS last_email_error TEXT`;
			await sql`CREATE TABLE IF NOT EXISTS email_send_log (
				id BIGSERIAL PRIMARY KEY,
				lead_id INTEGER,
				email TEXT NOT NULL,
				kind TEXT NOT NULL,
				dedupe_key TEXT UNIQUE,
				resend_email_id TEXT,
				status TEXT NOT NULL,
				error_message TEXT,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)`;
			await sql`CREATE INDEX IF NOT EXISTS email_send_log_created_idx ON email_send_log (created_at)`;
			await sql`UPDATE email_leads
				SET next_broker_reminder_at = created_at + INTERVAL '90 days'
				WHERE next_broker_reminder_at IS NULL AND unsubscribed_at IS NULL`;
		})().catch((err) => {
			ready = null;
			throw err;
		});
	}
	return ready;
}

export type InsertLeadResult = {
	already: boolean;
	leadId: number;
	email: string;
	resubscribed: boolean;
	needsWelcome: boolean;
};

type PriorLead = {
	id: number;
	unsubscribed_at: string | null;
	welcome_sent_at: string | null;
	next_broker_reminder_at: string | null;
};

/** Records a lead. The same email + magnet + context within 24h is treated as a repeat and not duplicated. */
export async function insertLead(input: {
	email: string;
	sourcePath: string;
	leadMagnet: LeadMagnet;
	contextValue: string | null;
	proInterests: string[] | null;
}): Promise<InsertLeadResult> {
	await ensureLeadsSchema();
	const sql = sqlClient();
	const prior = (await sql`
		SELECT id, unsubscribed_at, welcome_sent_at, next_broker_reminder_at
		FROM email_leads
		WHERE email = ${input.email}
		ORDER BY created_at DESC`) as PriorLead[];
	const wasUnsubscribed = prior.some((r) => r.unsubscribed_at);
	const welcomeAlreadySent = prior.some((r) => r.welcome_sent_at);
	const hasFutureReminder = prior.some(
		(r) => r.next_broker_reminder_at && new Date(r.next_broker_reminder_at).getTime() > Date.now()
	);

	// Re-submitting the signup form after an unsubscribe is an explicit opt-in again.
	if (wasUnsubscribed) {
		await sql`UPDATE email_leads SET unsubscribed_at = NULL WHERE email = ${input.email}`;
	}

	const recent = (await sql`
		SELECT id FROM email_leads
		WHERE email = ${input.email} AND lead_magnet = ${input.leadMagnet}
			AND context_value IS NOT DISTINCT FROM ${input.contextValue}
			AND created_at > NOW() - INTERVAL '24 hours'
		ORDER BY created_at DESC
		LIMIT 1`) as { id: number }[];

	let leadId: number;
	let already = false;
	if (recent.length && !input.proInterests?.length) {
		already = true;
		leadId = Number(recent[0].id);
	} else {
		const inserted = (await sql`
			INSERT INTO email_leads (email, source_path, lead_magnet, context_value, pro_interests, next_broker_reminder_at)
			VALUES (
				${input.email},
				${input.sourcePath},
				${input.leadMagnet},
				${input.contextValue},
				${input.proInterests},
				NOW() + INTERVAL '90 days'
			)
			RETURNING id`) as { id: number }[];
		leadId = Number(inserted[0].id);
		already = recent.length > 0;
	}

	if (!hasFutureReminder) {
		await sql`
			UPDATE email_leads
			SET next_broker_reminder_at = COALESCE(next_broker_reminder_at, NOW() + INTERVAL '90 days')
			WHERE email = ${input.email} AND next_broker_reminder_at IS NULL`;
	}
	if (wasUnsubscribed && !hasFutureReminder) {
		await sql`
			UPDATE email_leads
			SET next_broker_reminder_at = NOW() + INTERVAL '90 days'
			WHERE email = ${input.email}
				AND (next_broker_reminder_at IS NULL OR next_broker_reminder_at <= NOW())`;
	}

	return {
		already,
		leadId,
		email: input.email,
		resubscribed: wasUnsubscribed,
		needsWelcome: !welcomeAlreadySent
	};
}
