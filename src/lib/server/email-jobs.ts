import { openSettlements } from '../content/settlements';
import { sqlClient } from './db';
import {
	isEmailConfigured,
	isoWeekKey,
	markLeadEmailResult,
	sendBrokerReminder,
	sendSettlementAlert,
	sendWeeklyDigest,
	sendWelcomeEmail,
	settlementsDueSoon,
	syncResendContact,
	type SendResult
} from './email';
import { govNumbersByAreaCode, topGovNumbers, type GovNumber } from './gov';
import { ensureLeadsSchema } from './leads';

export type JobCounts = {
	attempted: number;
	sent: number;
	skipped: number;
	failed: number;
	rateLimited: number;
	capped: boolean;
};

function emptyCounts(): JobCounts {
	return { attempted: 0, sent: 0, skipped: 0, failed: 0, rateLimited: 0, capped: false };
}

function tally(counts: JobCounts, result: SendResult): void {
	counts.attempted += 1;
	if (result.ok) counts.sent += 1;
	else if (result.reason === 'cap') counts.capped = true;
	else if (result.reason === 'rate_limited') counts.rateLimited += 1;
	else if (result.reason === 'failed') counts.failed += 1;
	else counts.skipped += 1;
}

function areaCodeFromLead(row: {
	lead_magnet: string;
	context_value: string | null;
	source_path: string;
}): string | null {
	if (
		(row.lead_magnet === 'area_code_alert' || row.lead_magnet === 'neighbor_spoof') &&
		row.context_value &&
		/^\d{3}$/.test(row.context_value)
	) {
		return row.context_value;
	}
	const fromPath = row.source_path.match(/^\/area-code\/(\d{3})(?:\/|$)/);
	if (fromPath) return fromPath[1];
	if (row.lead_magnet === 'number_alert' && row.context_value) {
		const m = row.context_value.match(/^\+1(\d{3})\d+$/);
		if (m) return m[1];
	}
	return null;
}

type LeadRow = {
	id: number;
	email: string;
	lead_magnet: string;
	context_value: string | null;
	source_path: string;
};

export async function runWelcomeRetries(): Promise<JobCounts> {
	const counts = emptyCounts();
	if (!isEmailConfigured()) return counts;
	await ensureLeadsSchema();
	const sql = sqlClient();
	const rows = (await sql`
		SELECT DISTINCT ON (email)
			id, email
		FROM email_leads
		WHERE unsubscribed_at IS NULL
			AND welcome_sent_at IS NULL
			AND welcome_attempts < 3
		ORDER BY email, created_at DESC
		LIMIT 100`) as { id: number; email: string }[];

	for (const row of rows) {
		const result = await sendWelcomeEmail({ email: row.email, leadId: row.id });
		tally(counts, result);
		if (result.ok || result.reason === 'already_sent') {
			try {
				const sync = await syncResendContact(row.email, { unsubscribed: false });
				if (sync.id) await markLeadEmailResult(row.email, { resendContactId: sync.id });
			} catch (err) {
				console.error('welcome contact sync failed', err);
			}
		}
		if (
			counts.capped ||
			(!result.ok && (result.reason === 'rate_limited' || result.reason === 'not_configured'))
		)
			break;
	}
	return counts;
}

export async function runBrokerReminders(): Promise<JobCounts> {
	const counts = emptyCounts();
	if (!isEmailConfigured()) return counts;
	await ensureLeadsSchema();
	const sql = sqlClient();
	const rows = (await sql`
		SELECT DISTINCT ON (email)
			id, email
		FROM email_leads
		WHERE unsubscribed_at IS NULL
			AND next_broker_reminder_at IS NOT NULL
			AND next_broker_reminder_at <= NOW()
		ORDER BY email, next_broker_reminder_at ASC, created_at DESC
		LIMIT 100`) as { id: number; email: string }[];

	for (const row of rows) {
		const result = await sendBrokerReminder({ email: row.email, leadId: row.id });
		tally(counts, result);
		if (
			counts.capped ||
			(!result.ok && (result.reason === 'rate_limited' || result.reason === 'not_configured'))
		)
			break;
	}
	return counts;
}

export async function runSettlementAlerts(): Promise<JobCounts & { settlements: string[] }> {
	const counts = emptyCounts();
	const due = settlementsDueSoon();
	if (!isEmailConfigured() || due.length === 0)
		return { ...counts, settlements: due.map((s) => s.slug) };

	const openSlugs = new Set(openSettlements().map((s) => s.slug));
	const valid = due.filter((s) => openSlugs.has(s.slug));
	if (valid.length === 0) return { ...counts, settlements: [] };

	await ensureLeadsSchema();
	const sql = sqlClient();
	const rows = (await sql`
		SELECT DISTINCT ON (email)
			id, email
		FROM email_leads
		WHERE unsubscribed_at IS NULL
		ORDER BY email, created_at DESC
		LIMIT 1000`) as { id: number; email: string }[];

	outer: for (const settlement of valid) {
		for (const row of rows) {
			const result = await sendSettlementAlert({
				email: row.email,
				leadId: row.id,
				settlement
			});
			tally(counts, result);
			if (
				counts.capped ||
				(!result.ok && (result.reason === 'rate_limited' || result.reason === 'not_configured'))
			)
				break outer;
		}
	}
	return { ...counts, settlements: valid.map((s) => s.slug) };
}

export async function loadDigestNumbers(areaCode: string | null): Promise<GovNumber[]> {
	const national = async (): Promise<GovNumber[]> => {
		const recent = await topGovNumbers(8, 30, 1);
		if (recent.length >= 3) return recent;
		return topGovNumbers(8, 3650, 1);
	};
	if (areaCode && /^\d{3}$/.test(areaCode)) {
		const local = await govNumbersByAreaCode(areaCode, 8);
		if (local.numbers.length >= 3) return local.numbers;
		const fallback = await national();
		const merged = [...local.numbers];
		for (const n of fallback) {
			if (!merged.some((m) => m.e164 === n.e164)) merged.push(n);
			if (merged.length >= 8) break;
		}
		return merged;
	}
	return national();
}

export async function runWeeklyDigests(): Promise<JobCounts> {
	const counts = emptyCounts();
	if (!isEmailConfigured()) return counts;
	await ensureLeadsSchema();
	const sql = sqlClient();
	const weekKey = isoWeekKey();
	const rows = (await sql`
		SELECT DISTINCT ON (l.email)
			l.id,
			l.email,
			l.lead_magnet,
			l.context_value,
			l.source_path
		FROM email_leads l
		WHERE l.unsubscribed_at IS NULL
			AND (l.last_digest_sent_at IS NULL OR l.last_digest_sent_at < NOW() - INTERVAL '6 days')
			AND NOT EXISTS (
				SELECT 1 FROM email_send_log s
				WHERE s.email = l.email
					AND s.kind = 'weekly_digest'
					AND s.status = 'sent'
					AND s.dedupe_key = ${'digest:'} || l.email || ${':' + weekKey}
			)
		ORDER BY l.email,
			CASE
				WHEN l.lead_magnet IN ('area_code_alert', 'neighbor_spoof') AND l.context_value ~ '^[0-9]{3}$' THEN 0
				WHEN l.source_path ~ '^/area-code/[0-9]{3}' THEN 1
				WHEN l.lead_magnet = 'number_alert' THEN 2
				ELSE 3
			END,
			l.created_at DESC
		LIMIT 200`) as LeadRow[];

	const cache = new Map<string, GovNumber[]>();
	const load = async (npa: string | null) => {
		const key = npa ?? '*';
		const hit = cache.get(key);
		if (hit) return hit;
		const loaded = await loadDigestNumbers(npa);
		cache.set(key, loaded);
		return loaded;
	};

	for (const row of rows) {
		const areaCode = areaCodeFromLead(row);
		const numbers = await load(areaCode);
		const result = await sendWeeklyDigest({
			email: row.email,
			leadId: row.id,
			areaCode,
			numbers
		});
		tally(counts, result);
		if (
			counts.capped ||
			(!result.ok && (result.reason === 'rate_limited' || result.reason === 'not_configured'))
		)
			break;
	}
	return counts;
}

export async function runEmailQueue(): Promise<{
	welcomes: JobCounts;
	brokers: JobCounts;
	settlements: JobCounts & { settlements: string[] };
	digests: JobCounts;
}> {
	const welcomes = await runWelcomeRetries();
	const brokers = welcomes.capped ? emptyCounts() : await runBrokerReminders();
	const stopped = welcomes.capped || brokers.capped;
	const settlements = stopped
		? { ...emptyCounts(), settlements: settlementsDueSoon().map((s) => s.slug) }
		: await runSettlementAlerts();
	const digests = stopped || settlements.capped ? emptyCounts() : await runWeeklyDigests();
	return { welcomes, brokers, settlements, digests };
}
