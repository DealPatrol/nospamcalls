import { ensureSchema, sqlClient } from './db';

export type BlockedNumber = {
	e164: string;
	caller_label: string | null;
	call_type: string;
	note: string | null;
	created_at: string;
};

export async function listBlocklist(accountKey: string): Promise<BlockedNumber[]> {
	await ensureSchema();
	const rows = await sqlClient()`
		SELECT e164, caller_label, call_type, note, created_at FROM personal_blocklists
		WHERE account_key = ${accountKey} ORDER BY created_at DESC LIMIT 1000`;
	return (rows as Record<string, unknown>[]).map((r) => ({
		e164: String(r.e164),
		caller_label: (r.caller_label as string) ?? null,
		call_type: String(r.call_type),
		note: (r.note as string) ?? null,
		created_at: new Date(String(r.created_at)).toISOString()
	}));
}

export async function addToBlocklist(input: {
	accountKey: string;
	e164: string;
	label: string | null;
	callType: string;
	note: string | null;
}): Promise<{ already: boolean }> {
	await ensureSchema();
	const rows = await sqlClient()`
		INSERT INTO personal_blocklists (account_key, e164, caller_label, call_type, note)
		VALUES (${input.accountKey}, ${input.e164}, ${input.label}, ${input.callType}, ${input.note})
		ON CONFLICT (account_key, e164) DO NOTHING
		RETURNING id`;
	return { already: rows.length === 0 };
}

export async function removeFromBlocklist(accountKey: string, e164: string): Promise<void> {
	await ensureSchema();
	await sqlClient()`DELETE FROM personal_blocklists WHERE account_key = ${accountKey} AND e164 = ${e164}`;
}

export type EvidenceLog = {
	id: number;
	e164: string;
	occurred_at: string;
	call_or_text: string;
	company_name: string | null;
	company_contact: string | null;
	used_automated: boolean;
	on_dnc_31_days: boolean;
	revoked_consent_at: string | null;
	summary: string | null;
};

export async function listEvidence(accountKey: string): Promise<EvidenceLog[]> {
	await ensureSchema();
	const rows = await sqlClient()`
		SELECT id, e164, occurred_at, call_or_text, company_name, company_contact, used_automated,
		       on_dnc_31_days, revoked_consent_at, summary
		FROM tcpa_evidence_logs WHERE account_key = ${accountKey}
		ORDER BY occurred_at DESC LIMIT 500`;
	return (rows as Record<string, unknown>[]).map((r) => ({
		id: Number(r.id),
		e164: String(r.e164),
		occurred_at: new Date(String(r.occurred_at)).toISOString(),
		call_or_text: String(r.call_or_text),
		company_name: (r.company_name as string) ?? null,
		company_contact: (r.company_contact as string) ?? null,
		used_automated: Boolean(r.used_automated),
		on_dnc_31_days: Boolean(r.on_dnc_31_days),
		revoked_consent_at: (r.revoked_consent_at as string) ?? null,
		summary: (r.summary as string) ?? null
	}));
}

export async function addEvidence(accountKey: string, e: Omit<EvidenceLog, 'id'>): Promise<void> {
	await ensureSchema();
	await sqlClient()`
		INSERT INTO tcpa_evidence_logs (account_key, e164, occurred_at, call_or_text, company_name, company_contact,
			used_automated, on_dnc_31_days, revoked_consent_at, summary)
		VALUES (${accountKey}, ${e.e164}, ${e.occurred_at}, ${e.call_or_text}, ${e.company_name}, ${e.company_contact},
			${e.used_automated}, ${e.on_dnc_31_days}, ${e.revoked_consent_at}, ${e.summary})`;
}

export async function removeEvidence(accountKey: string, id: number): Promise<void> {
	await ensureSchema();
	await sqlClient()`DELETE FROM tcpa_evidence_logs WHERE account_key = ${accountKey} AND id = ${id}`;
}

export async function listOptout(accountKey: string): Promise<Record<string, string>> {
	await ensureSchema();
	const rows = await sqlClient()`SELECT broker_slug, status FROM broker_optout_progress WHERE account_key = ${accountKey}`;
	return Object.fromEntries((rows as { broker_slug: string; status: string }[]).map((r) => [r.broker_slug, r.status]));
}

export async function setOptout(accountKey: string, slug: string, status: string): Promise<void> {
	await ensureSchema();
	await sqlClient()`
		INSERT INTO broker_optout_progress (account_key, broker_slug, status, updated_at)
		VALUES (${accountKey}, ${slug}, ${status}, NOW())
		ON CONFLICT (account_key, broker_slug) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()`;
}
