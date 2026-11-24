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
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)`;
			await sql`CREATE INDEX IF NOT EXISTS email_leads_created_idx ON email_leads (created_at DESC)`;
			await sql`CREATE INDEX IF NOT EXISTS email_leads_magnet_idx ON email_leads (lead_magnet)`;
			await sql`CREATE INDEX IF NOT EXISTS email_leads_email_idx ON email_leads (email)`;
		})().catch((err) => {
			ready = null;
			throw err;
		});
	}
	return ready;
}

/** Records a lead. The same email + magnet + context within 24h is treated as a repeat and not duplicated. */
export async function insertLead(input: {
	email: string;
	sourcePath: string;
	leadMagnet: LeadMagnet;
	contextValue: string | null;
	proInterests: string[] | null;
}): Promise<{ already: boolean }> {
	await ensureLeadsSchema();
	const sql = sqlClient();
	const recent = await sql`
		SELECT id FROM email_leads
		WHERE email = ${input.email} AND lead_magnet = ${input.leadMagnet}
			AND context_value IS NOT DISTINCT FROM ${input.contextValue}
			AND created_at > NOW() - INTERVAL '24 hours'
		LIMIT 1`;
	if (recent.length && !input.proInterests?.length) return { already: true };
	await sql`
		INSERT INTO email_leads (email, source_path, lead_magnet, context_value, pro_interests)
		VALUES (${input.email}, ${input.sourcePath}, ${input.leadMagnet}, ${input.contextValue}, ${input.proInterests})`;
	return { already: recent.length > 0 };
}
