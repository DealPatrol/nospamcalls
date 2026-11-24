import { neon } from '@neondatabase/serverless';
import { createHash, createHmac } from 'node:crypto';
import { hourWindow } from '../security';

export function sqlClient() {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error('DATABASE_URL is not set');
	return neon(url);
}

let schemaReady: Promise<void> | null = null;

/** Idempotently creates the tables used by the blocking and Get Paid tools. */
export function ensureSchema(): Promise<void> {
	if (!schemaReady) {
		schemaReady = createSchema().catch((err) => {
			schemaReady = null;
			throw err;
		});
	}
	return schemaReady;
}

async function createSchema() {
	const sql = sqlClient();
	await sql`CREATE TABLE IF NOT EXISTS gov_spam_numbers (
		e164 TEXT PRIMARY KEY,
		ftc_count INT NOT NULL DEFAULT 0,
		fcc_count INT NOT NULL DEFAULT 0,
		total_gov_count INT NOT NULL DEFAULT 0,
		top_subject TEXT,
		top_method TEXT,
		sample_city TEXT,
		sample_state TEXT,
		first_reported_at TIMESTAMPTZ,
		last_reported_at TIMESTAMPTZ,
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`;
	await sql`CREATE INDEX IF NOT EXISTS gov_spam_numbers_rank_idx ON gov_spam_numbers (total_gov_count DESC, last_reported_at DESC)`;
	await sql`CREATE TABLE IF NOT EXISTS gov_complaint_ids (
		source TEXT NOT NULL,
		complaint_id TEXT NOT NULL,
		e164 TEXT NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		PRIMARY KEY (source, complaint_id)
	)`;
	await sql`CREATE TABLE IF NOT EXISTS personal_blocklists (
		id SERIAL PRIMARY KEY,
		account_key TEXT NOT NULL,
		e164 TEXT NOT NULL,
		caller_label TEXT,
		call_type TEXT NOT NULL DEFAULT 'robocall',
		note TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		UNIQUE (account_key, e164)
	)`;
	await sql`CREATE TABLE IF NOT EXISTS tcpa_evidence_logs (
		id SERIAL PRIMARY KEY,
		account_key TEXT NOT NULL,
		e164 TEXT NOT NULL,
		occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		call_or_text TEXT NOT NULL DEFAULT 'call',
		company_name TEXT,
		company_contact TEXT,
		used_automated BOOLEAN NOT NULL DEFAULT TRUE,
		on_dnc_31_days BOOLEAN NOT NULL DEFAULT FALSE,
		revoked_consent_at TEXT,
		summary TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`;
	await sql`CREATE INDEX IF NOT EXISTS tcpa_evidence_logs_account_idx ON tcpa_evidence_logs (account_key, occurred_at DESC)`;
	await sql`CREATE TABLE IF NOT EXISTS broker_optout_progress (
		account_key TEXT NOT NULL,
		broker_slug TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'todo',
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		PRIMARY KEY (account_key, broker_slug)
	)`;
}

const TOKEN_RE = /^[a-f0-9]{32}$/;
const EMAIL_KEY_RE = /^em_[a-f0-9]{40}$/;

/**
 * Account keys are either a random 32-hex token created in the browser, or
 * "em_" + an HMAC of a normalized email (so the raw email is never stored as the key).
 */
export function isAccountKey(value: unknown): value is string {
	return typeof value === 'string' && (TOKEN_RE.test(value) || EMAIL_KEY_RE.test(value));
}

export function emailAccountKey(email: string): string {
	const secret = process.env.IP_HASH_SECRET ?? 'nospamcalls';
	return `em_${createHmac('sha256', secret).update(`account:${email}`).digest('hex').slice(0, 40)}`;
}

/** Moves anonymous-token data onto an email key so the same list follows the user across devices. */
export async function mergeAccount(fromKey: string, toKey: string): Promise<void> {
	if (fromKey === toKey) return;
	await ensureSchema();
	const sql = sqlClient();
	await sql`INSERT INTO personal_blocklists (account_key, e164, caller_label, call_type, note, created_at)
		SELECT ${toKey}, e164, caller_label, call_type, note, created_at FROM personal_blocklists WHERE account_key = ${fromKey}
		ON CONFLICT (account_key, e164) DO NOTHING`;
	await sql`DELETE FROM personal_blocklists WHERE account_key = ${fromKey}`;
	await sql`UPDATE tcpa_evidence_logs SET account_key = ${toKey} WHERE account_key = ${fromKey}`;
	await sql`INSERT INTO broker_optout_progress (account_key, broker_slug, status, updated_at)
		SELECT ${toKey}, broker_slug, status, updated_at FROM broker_optout_progress WHERE account_key = ${fromKey}
		ON CONFLICT (account_key, broker_slug) DO UPDATE SET status = EXCLUDED.status, updated_at = EXCLUDED.updated_at
		WHERE broker_optout_progress.updated_at < EXCLUDED.updated_at`;
	await sql`DELETE FROM broker_optout_progress WHERE account_key = ${fromKey}`;
}

/** Shared hourly rate limiter using the existing rate_limits table. Returns true when allowed. */
export async function allowAction(ipHash: string, action: string, perHour: number): Promise<boolean> {
	const sql = sqlClient();
	const rows = await sql`
		INSERT INTO rate_limits (ip_hash, action, window_start, count)
		VALUES (${ipHash}, ${action}, ${hourWindow().toISOString()}, 1)
		ON CONFLICT (ip_hash, action, window_start)
		DO UPDATE SET count = rate_limits.count + 1
		RETURNING count`;
	return Number((rows[0] as { count: number }).count) <= perHour;
}

export function shortHash(value: string): string {
	return createHash('sha256').update(value).digest('hex').slice(0, 16);
}
