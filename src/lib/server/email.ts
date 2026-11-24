import { createHmac, timingSafeEqual } from 'node:crypto';
import { sqlClient } from './db';
import { ensureLeadsSchema } from './leads';
import { openSettlements, type Settlement } from '../content/settlements';
import { e164ToSlug, formatNational } from '../phone';
import type { GovNumber } from './gov';

export const DAILY_SEND_CAP_TOTAL = 95;
export const DAILY_SEND_CAP_CRON = 85;
export const WELCOME_FETCH_TIMEOUT_MS = 5_000;
export const CRON_FETCH_TIMEOUT_MS = 15_000;

export type EmailKind = 'welcome' | 'weekly_digest' | 'broker_reminder' | 'settlement_alert';

export type SendResult =
	| { ok: true; id: string; skipped?: false }
	| {
			ok: false;
			skipped: true;
			reason: 'not_configured' | 'unsubscribed' | 'already_sent' | 'rate_limited' | 'cap';
	  }
	| { ok: false; skipped?: false; reason: 'failed'; error: string };

const REPLY_TO = 'info@nospamcalls.org';
const DEFAULT_FROM = 'NoSpamCalls <info@nospamcalls.org>';
const DEFAULT_ALERTS_FROM = 'NoSpamCalls Alerts <alerts@nospamcalls.org>';
const ADVISORY_LOCK = 87231001;

export function publicSiteUrl(): string {
	const explicit = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '');
	if (explicit) return explicit;
	return 'https://nospamcalls.org';
}

function resendApiKey(): string | null {
	const key = process.env.RESEND_API_KEY?.trim();
	return key || null;
}

function fromAddress(kind: EmailKind): string {
	if (kind === 'weekly_digest' || kind === 'settlement_alert') {
		return process.env.RESEND_ALERTS_FROM_EMAIL?.trim() || DEFAULT_ALERTS_FROM;
	}
	return process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;
}

function unsubscribeSecret(): string | null {
	const secret = process.env.UNSUBSCRIBE_SECRET?.trim() || process.env.IP_HASH_SECRET?.trim();
	return secret || null;
}

export function isEmailConfigured(): boolean {
	return Boolean(resendApiKey());
}

export function isoWeekKey(now = new Date()): string {
	const tmp = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	const day = tmp.getUTCDay() || 7;
	tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
	const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
	return `${tmp.getUTCFullYear()}-${String(week).padStart(2, '0')}`;
}

export function yearMonthKey(now = new Date()): string {
	return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function signUnsubscribeToken(email: string): string {
	const secret = unsubscribeSecret();
	if (!secret) throw new Error('UNSUBSCRIBE_SECRET is not set');
	const payload = Buffer.from(JSON.stringify({ e: email }), 'utf8').toString('base64url');
	const sig = createHmac('sha256', secret).update(payload).digest('base64url');
	return `${payload}.${sig}`;
}

function safeEqual(a: string, b: string): boolean {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
}

export function verifyUnsubscribeToken(token: string): string | null {
	const secret = unsubscribeSecret();
	if (!secret || !token) return null;
	const dot = token.lastIndexOf('.');
	if (dot <= 0) return null;
	const payload = token.slice(0, dot);
	const sig = token.slice(dot + 1);
	if (!payload || !sig) return null;
	const expected = createHmac('sha256', secret).update(payload).digest('base64url');
	if (!safeEqual(sig, expected)) return null;
	try {
		const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
			e?: unknown;
		};
		if (typeof parsed.e !== 'string' || !parsed.e.includes('@')) return null;
		return parsed.e;
	} catch {
		return null;
	}
}

export function unsubscribeApiUrl(email: string): string {
	const token = signUnsubscribeToken(email);
	return `${publicSiteUrl()}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function unsubscribePageUrl(email: string): string {
	const token = signUnsubscribeToken(email);
	return `${publicSiteUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}

function listUnsubscribeHeaders(email: string): Record<string, string> {
	return {
		'List-Unsubscribe': `<${unsubscribeApiUrl(email)}>`,
		'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
	};
}

function clipError(err: unknown): string {
	let msg: string;
	if (err instanceof Error) msg = err.message;
	else if (typeof err === 'string') msg = err;
	else msg = String(err);
	return msg.replace(/\s+/g, ' ').trim().slice(0, 500);
}

async function resendFetch(
	path: string,
	init: RequestInit & { timeoutMs?: number }
): Promise<{ ok: boolean; status: number; body: unknown }> {
	const key = resendApiKey();
	if (!key) return { ok: false, status: 0, body: { message: 'not_configured' } };
	const timeoutMs = init.timeoutMs ?? CRON_FETCH_TIMEOUT_MS;
	const { timeoutMs: _ignored, ...rest } = init;
	void _ignored;
	const res = await fetch(`https://api.resend.com${path}`, {
		...rest,
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json',
			...(rest.headers ?? {})
		},
		signal: AbortSignal.timeout(timeoutMs)
	});
	const body: unknown = await res.json().catch(() => null);
	return { ok: res.ok, status: res.status, body };
}

export async function syncResendContact(
	email: string,
	opts: { unsubscribed: boolean },
	timeoutMs = WELCOME_FETCH_TIMEOUT_MS
): Promise<{ ok: boolean; id?: string; skipped?: boolean; error?: string }> {
	if (!resendApiKey()) return { ok: false, skipped: true, error: 'not_configured' };
	try {
		const created = await resendFetch('/contacts', {
			method: 'POST',
			body: JSON.stringify({ email, unsubscribed: opts.unsubscribed }),
			timeoutMs
		});
		if (created.ok) {
			const id = contactIdFromBody(created.body);
			return { ok: true, id };
		}
		// Already exists (or unprocessable conflict): update by email. No audience_id required on the global Contacts API.
		if (created.status === 409 || created.status === 422) {
			const updated = await resendFetch(`/contacts/${encodeURIComponent(email)}`, {
				method: 'PATCH',
				body: JSON.stringify({ unsubscribed: opts.unsubscribed }),
				timeoutMs
			});
			if (updated.ok) {
				return { ok: true, id: contactIdFromBody(updated.body) };
			}
			return {
				ok: false,
				error: clipError(errorMessage(updated.body) ?? `HTTP ${updated.status}`)
			};
		}
		return { ok: false, error: clipError(errorMessage(created.body) ?? `HTTP ${created.status}`) };
	} catch (err) {
		return { ok: false, error: clipError(err) };
	}
}

function contactIdFromBody(body: unknown): string | undefined {
	if (!body || typeof body !== 'object') return undefined;
	const id = (body as { id?: unknown }).id;
	return typeof id === 'string' ? id : undefined;
}

function errorMessage(body: unknown): string | null {
	if (!body || typeof body !== 'object') return null;
	const msg = (body as { message?: unknown }).message;
	return typeof msg === 'string' ? msg : null;
}

export async function countSentTodayUtc(): Promise<number> {
	await ensureLeadsSchema();
	const sql = sqlClient();
	const rows = await sql`
		SELECT COUNT(*)::int AS n
		FROM email_send_log
		WHERE status = 'sent'
			AND created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`;
	return Number((rows[0] as { n: number }).n);
}

type ReserveRow = { id: number; action: string };

async function reserveSend(input: {
	leadId: number | null;
	email: string;
	kind: EmailKind;
	dedupeKey: string;
	cap: number;
}): Promise<{ reservedId: number | null; alreadySent: boolean; capped: boolean }> {
	await ensureLeadsSchema();
	const sql = sqlClient();
	const rows = (await sql`
		WITH lock AS MATERIALIZED (
			SELECT pg_advisory_xact_lock(${ADVISORY_LOCK})
		),
		cap AS MATERIALIZED (
			SELECT COUNT(*)::int AS n
			FROM email_send_log, lock
			WHERE status = 'sent'
				AND created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
		),
		existing AS (
			SELECT id, status FROM email_send_log WHERE dedupe_key = ${input.dedupeKey}
		),
		ins AS (
			INSERT INTO email_send_log (lead_id, email, kind, dedupe_key, status)
			SELECT ${input.leadId}, ${input.email}, ${input.kind}, ${input.dedupeKey}, 'sending'
			FROM cap
			WHERE cap.n < ${input.cap}
				AND NOT EXISTS (SELECT 1 FROM existing)
			RETURNING id, 'inserted' AS action
		),
		upd AS (
			UPDATE email_send_log l
			SET status = 'sending', error_message = NULL, lead_id = COALESCE(${input.leadId}, l.lead_id)
			FROM cap
			WHERE l.dedupe_key = ${input.dedupeKey}
				AND l.status IS DISTINCT FROM 'sent'
				AND cap.n < ${input.cap}
				AND NOT EXISTS (SELECT 1 FROM ins)
			RETURNING l.id, 'updated' AS action
		)
		SELECT id, action FROM ins
		UNION ALL
		SELECT id, action FROM upd
		UNION ALL
		SELECT id, 'already_sent' AS action FROM existing WHERE status = 'sent'
	`) as ReserveRow[];

	if (rows.some((r) => r.action === 'already_sent')) {
		return { reservedId: null, alreadySent: true, capped: false };
	}
	const reserved = rows.find((r) => r.action === 'inserted' || r.action === 'updated');
	if (reserved) return { reservedId: Number(reserved.id), alreadySent: false, capped: false };
	return { reservedId: null, alreadySent: false, capped: true };
}

async function finalizeLog(
	id: number,
	status: 'sent' | 'failed' | 'rate_limited' | 'skipped',
	opts?: { resendId?: string; error?: string }
): Promise<void> {
	const sql = sqlClient();
	await sql`
		UPDATE email_send_log
		SET status = ${status},
			resend_email_id = COALESCE(${opts?.resendId ?? null}, resend_email_id),
			error_message = ${opts?.error ?? null}
		WHERE id = ${id}`;
}

export type EmailContent = { subject: string; text: string; html: string };

async function deliverEmail(input: {
	leadId: number | null;
	email: string;
	kind: EmailKind;
	dedupeKey: string;
	cap: number;
	content: EmailContent;
	timeoutMs: number;
}): Promise<SendResult> {
	if (!resendApiKey()) return { ok: false, skipped: true, reason: 'not_configured' };

	const reservation = await reserveSend({
		leadId: input.leadId,
		email: input.email,
		kind: input.kind,
		dedupeKey: input.dedupeKey,
		cap: input.cap
	});
	if (reservation.alreadySent) return { ok: false, skipped: true, reason: 'already_sent' };
	if (reservation.capped || reservation.reservedId == null) {
		return { ok: false, skipped: true, reason: 'cap' };
	}

	try {
		const sent = await resendFetch('/emails', {
			method: 'POST',
			timeoutMs: input.timeoutMs,
			body: JSON.stringify({
				from: fromAddress(input.kind),
				to: [input.email],
				reply_to: REPLY_TO,
				subject: input.content.subject,
				text: input.content.text,
				html: input.content.html,
				headers: listUnsubscribeHeaders(input.email)
			})
		});
		if (sent.status === 429) {
			await finalizeLog(reservation.reservedId, 'rate_limited', {
				error: clipError(errorMessage(sent.body) ?? 'Resend rate limited (429)')
			});
			return { ok: false, skipped: true, reason: 'rate_limited' };
		}
		if (!sent.ok) {
			const error = clipError(errorMessage(sent.body) ?? `HTTP ${sent.status}`);
			await finalizeLog(reservation.reservedId, 'failed', { error });
			return { ok: false, reason: 'failed', error };
		}
		const id = contactIdFromBody(sent.body) ?? '';
		await finalizeLog(reservation.reservedId, 'sent', { resendId: id || undefined });
		return { ok: true, id };
	} catch (err) {
		const error = clipError(err);
		await finalizeLog(reservation.reservedId, 'failed', { error });
		return { ok: false, reason: 'failed', error };
	}
}

export async function markLeadEmailResult(
	email: string,
	patch: {
		welcomeSent?: boolean;
		incrementWelcomeAttempts?: boolean;
		lastDigestSent?: boolean;
		advanceBrokerReminder?: boolean;
		settlementAlerted?: boolean;
		resendContactId?: string | null;
		lastError?: string | null;
	}
): Promise<void> {
	await ensureLeadsSchema();
	const sql = sqlClient();
	const attemptsInc = patch.incrementWelcomeAttempts ? 1 : 0;
	const errorValue = patch.lastError === undefined ? null : patch.lastError;
	const clearError = patch.lastError === null;
	await sql`
		UPDATE email_leads
		SET
			welcome_sent_at = CASE WHEN ${patch.welcomeSent ?? false} THEN NOW() ELSE welcome_sent_at END,
			welcome_attempts = welcome_attempts + ${attemptsInc},
			last_digest_sent_at = CASE WHEN ${patch.lastDigestSent ?? false} THEN NOW() ELSE last_digest_sent_at END,
			next_broker_reminder_at = CASE
				WHEN ${patch.advanceBrokerReminder ?? false} THEN NOW() + INTERVAL '90 days'
				ELSE next_broker_reminder_at
			END,
			last_settlement_alert_at = CASE
				WHEN ${patch.settlementAlerted ?? false} THEN NOW()
				ELSE last_settlement_alert_at
			END,
			resend_contact_id = COALESCE(${patch.resendContactId ?? null}, resend_contact_id),
			last_email_error = CASE
				WHEN ${clearError} THEN NULL
				WHEN ${errorValue}::text IS NOT NULL THEN ${errorValue}
				ELSE last_email_error
			END
		WHERE email = ${email}`;
}

export async function unsubscribeByToken(
	token: string
): Promise<{ ok: true; email: string } | { ok: false; error: 'invalid_token' }> {
	const email = verifyUnsubscribeToken(token);
	if (!email) return { ok: false, error: 'invalid_token' };
	await ensureLeadsSchema();
	const sql = sqlClient();
	await sql`
		UPDATE email_leads
		SET unsubscribed_at = COALESCE(unsubscribed_at, NOW())
		WHERE email = ${email}`;
	try {
		const sync = await syncResendContact(email, { unsubscribed: true });
		if (sync.id) {
			await markLeadEmailResult(email, { resendContactId: sync.id, lastError: null });
		} else if (sync.error && sync.error !== 'not_configured') {
			await markLeadEmailResult(email, { lastError: sync.error });
		}
	} catch (err) {
		console.error('resend contact unsubscribe sync failed', err);
	}
	return { ok: true, email };
}

export async function sendWelcomeEmail(input: {
	email: string;
	leadId: number | null;
	timeoutMs?: number;
}): Promise<SendResult> {
	const result = await deliverEmail({
		leadId: input.leadId,
		email: input.email,
		kind: 'welcome',
		dedupeKey: `welcome:${input.email}`,
		cap: DAILY_SEND_CAP_TOTAL,
		content: welcomeContent(input.email),
		timeoutMs: input.timeoutMs ?? WELCOME_FETCH_TIMEOUT_MS
	});
	if (result.ok) {
		await markLeadEmailResult(input.email, {
			welcomeSent: true,
			incrementWelcomeAttempts: true,
			lastError: null
		});
	} else if (result.reason === 'already_sent') {
		await markLeadEmailResult(input.email, { welcomeSent: true, lastError: null });
	} else if (result.reason === 'not_configured') {
		return result;
	} else if (
		result.reason === 'failed' ||
		result.reason === 'rate_limited' ||
		result.reason === 'cap'
	) {
		const error = result.reason === 'failed' ? result.error : result.reason;
		await markLeadEmailResult(input.email, { incrementWelcomeAttempts: true, lastError: error });
	}
	return result;
}

export async function sendBrokerReminder(input: {
	email: string;
	leadId: number | null;
}): Promise<SendResult> {
	const result = await deliverEmail({
		leadId: input.leadId,
		email: input.email,
		kind: 'broker_reminder',
		dedupeKey: `broker:${input.email}:${yearMonthKey()}`,
		cap: DAILY_SEND_CAP_CRON,
		content: brokerReminderContent(input.email),
		timeoutMs: CRON_FETCH_TIMEOUT_MS
	});
	if (result.ok) {
		await markLeadEmailResult(input.email, { advanceBrokerReminder: true, lastError: null });
	} else if (result.reason === 'already_sent') {
		await markLeadEmailResult(input.email, { advanceBrokerReminder: true, lastError: null });
	} else if (result.reason === 'failed' || result.reason === 'rate_limited') {
		const error = result.reason === 'failed' ? result.error : result.reason;
		await markLeadEmailResult(input.email, { lastError: error });
	}
	return result;
}

export async function sendSettlementAlert(input: {
	email: string;
	leadId: number | null;
	settlement: Settlement;
}): Promise<SendResult> {
	const result = await deliverEmail({
		leadId: input.leadId,
		email: input.email,
		kind: 'settlement_alert',
		dedupeKey: `settlement:${input.email}:${input.settlement.slug}`,
		cap: DAILY_SEND_CAP_CRON,
		content: settlementAlertContent(input.email, input.settlement),
		timeoutMs: CRON_FETCH_TIMEOUT_MS
	});
	if (result.ok) {
		await markLeadEmailResult(input.email, { settlementAlerted: true, lastError: null });
	} else if (result.reason === 'already_sent') {
		await markLeadEmailResult(input.email, { settlementAlerted: true, lastError: null });
	} else if (result.reason === 'failed' || result.reason === 'rate_limited') {
		const error = result.reason === 'failed' ? result.error : result.reason;
		await markLeadEmailResult(input.email, { lastError: error });
	}
	return result;
}

export async function sendWeeklyDigest(input: {
	email: string;
	leadId: number | null;
	areaCode: string | null;
	numbers: GovNumber[];
}): Promise<SendResult> {
	const result = await deliverEmail({
		leadId: input.leadId,
		email: input.email,
		kind: 'weekly_digest',
		dedupeKey: `digest:${input.email}:${isoWeekKey()}`,
		cap: DAILY_SEND_CAP_CRON,
		content: weeklyDigestContent(input.email, input.areaCode, input.numbers),
		timeoutMs: CRON_FETCH_TIMEOUT_MS
	});
	if (result.ok) {
		await markLeadEmailResult(input.email, { lastDigestSent: true, lastError: null });
	} else if (result.reason === 'already_sent') {
		await markLeadEmailResult(input.email, { lastDigestSent: true, lastError: null });
	} else if (result.reason === 'failed' || result.reason === 'rate_limited') {
		const error = result.reason === 'failed' ? result.error : result.reason;
		await markLeadEmailResult(input.email, { lastError: error });
	}
	return result;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function formatLongDate(isoDay: string): string {
	const [year, month, day] = isoDay.split('-').map(Number);
	if (!year || !month || !day) return isoDay;
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(new Date(Date.UTC(year, month - 1, day)));
}

function toolLinks() {
	const base = publicSiteUrl();
	return {
		home: base,
		block: `${base}/block-spam-calls`,
		optOut: `${base}/opt-out`,
		getPaid: `${base}/get-paid`,
		data: `${base}/spam-call-data`,
		setup: `${base}/setup`,
		report: `${base}/report`,
		number: (e164: string) => `${base}/number/${e164ToSlug(e164)}`,
		area: (npa: string) => `${base}/area-code/${npa}`
	};
}

function footerText(email: string): string {
	return [
		'—',
		'You are receiving this because you signed up at nospamcalls.org.',
		`Unsubscribe: ${unsubscribePageUrl(email)}`,
		`Reply directly to ${REPLY_TO}.`,
		'NoSpamCalls is not a law firm and does not give legal advice. We cannot promise that spam calls will stop.'
	].join('\n');
}

function emailShell(title: string, innerHtml: string, email: string): string {
	const unsub = unsubscribePageUrl(email);
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f7f4ee;color:#12233a;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <p style="margin:0 0 16px;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;color:#0e6b66;font-weight:600;">NoSpamCalls</p>
    ${innerHtml}
    <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #d8d0c4;font-size:12px;line-height:1.5;color:#3b4c63;">
      You are receiving this because you signed up at
      <a href="${escapeHtml(publicSiteUrl())}" style="color:#0e6b66;">nospamcalls.org</a>.
      <a href="${escapeHtml(unsub)}" style="color:#0e6b66;">Unsubscribe</a>.
      Reply directly to <a href="mailto:${REPLY_TO}" style="color:#0e6b66;">${REPLY_TO}</a>.
      NoSpamCalls is not a law firm and does not give legal advice. We cannot promise that spam calls will stop.
    </p>
  </div>
</body>
</html>`;
}

function welcomeContent(email: string): EmailContent {
	const links = toolLinks();
	const subject = 'Your NoSpamCalls tools are ready';
	const text = [
		'Thanks for signing up at NoSpamCalls.',
		'',
		'The website is free. These tools are a good place to start:',
		`- Build a personal blocklist and download it as a .vcf file: ${links.block}`,
		`- Opt out of people-search and data-broker listings: ${links.optOut}`,
		`- See open TCPA settlement claim pages we have verified: ${links.getPaid}`,
		`- Browse live FTC and FCC spam-call complaint data: ${links.data}`,
		`- Set up carrier and phone spam blocking: ${links.setup}`,
		'',
		'We will occasionally email a weekly digest of frequently reported numbers, a reminder to re-check data-broker opt-outs about every 90 days, and a notice if a verified settlement deadline is coming up. You can unsubscribe at any time.',
		'',
		footerText(email)
	].join('\n');
	const html = emailShell(
		subject,
		`<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">Your NoSpamCalls tools are ready</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Thanks for signing up. The website is free. These tools are a good place to start:</p>
    <ul style="margin:0 0 16px;padding-left:1.2rem;font-size:16px;line-height:1.6;">
      <li><a href="${links.block}" style="color:#0e6b66;">Block spam calls</a> and download a personal blocklist as a .vcf file</li>
      <li><a href="${links.optOut}" style="color:#0e6b66;">Data-broker opt-out center</a></li>
      <li><a href="${links.getPaid}" style="color:#0e6b66;">Open settlement claim pages</a> we have verified from official sites</li>
      <li><a href="${links.data}" style="color:#0e6b66;">Live FTC and FCC spam-call data</a></li>
      <li><a href="${links.setup}" style="color:#0e6b66;">Phone and carrier setup</a></li>
    </ul>
    <p style="margin:0;font-size:16px;line-height:1.6;">We will occasionally email a weekly digest of frequently reported numbers, a reminder to re-check data-broker opt-outs about every 90 days, and a notice if a verified settlement deadline is coming up. You can unsubscribe at any time.</p>`,
		email
	);
	return { subject, text, html };
}

function brokerReminderContent(email: string): EmailContent {
	const links = toolLinks();
	const subject = 'Time to re-check your data-broker opt-outs';
	const text = [
		'About 90 days have passed since you signed up at NoSpamCalls — or since your last opt-out reminder.',
		'',
		'People-search and marketing-data sites can relist information after you opt out. If you still want your listings removed, walk through the free checklist again:',
		links.optOut,
		'',
		'We cannot promise that every listing will stay removed, and this is not legal advice.',
		'',
		footerText(email)
	].join('\n');
	const html = emailShell(
		subject,
		`<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">Time to re-check your data-broker opt-outs</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">About 90 days have passed since you signed up at NoSpamCalls — or since your last opt-out reminder.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">People-search and marketing-data sites can relist information after you opt out. If you still want your listings removed, walk through the free checklist again at <a href="${links.optOut}" style="color:#0e6b66;">nospamcalls.org/opt-out</a>.</p>
    <p style="margin:0;font-size:16px;line-height:1.6;">We cannot promise that every listing will stay removed, and this is not legal advice.</p>`,
		email
	);
	return { subject, text, html };
}

function weeklyDigestContent(
	email: string,
	areaCode: string | null,
	numbers: GovNumber[]
): EmailContent {
	const links = toolLinks();
	const areaLabel = areaCode ? ` in area code ${areaCode}` : '';
	const subject = areaCode
		? `This week's reported spam numbers in ${areaCode}`
		: "This week's most-reported spam numbers";
	const intro = areaCode
		? `Here are frequently reported numbers${areaLabel} from FTC and FCC complaint data stored on NoSpamCalls, plus the U.S. totals if local rows are thin.`
		: 'Here are frequently reported U.S. numbers from FTC and FCC complaint data stored on NoSpamCalls.';
	const numberLines =
		numbers.length > 0
			? numbers.map((n) => {
					const label = formatNational(n.e164);
					const bits = [`${n.total_gov_count} complaint${n.total_gov_count === 1 ? '' : 's'}`];
					if (n.top_subject) bits.push(n.top_subject);
					return `- ${label}: ${bits.join(', ')} — ${links.number(n.e164)}`;
				})
			: [
					`We do not have a fresh top-number list to share this week. You can check the live index any time: ${links.data}`
				];
	const areaLink = areaCode ? `\nArea code ${areaCode} page: ${links.area(areaCode)}` : '';
	const text = [
		intro,
		'',
		...numberLines,
		'',
		`Live index: ${links.data}`,
		`Report a number: ${links.report}`,
		`Block spam calls: ${links.block}`,
		areaLink.trim(),
		'',
		'Complaint counts come from official FTC and FCC records we ingest. They are not a verified identification of the caller.',
		'',
		footerText(email)
	]
		.filter((line) => line !== '')
		.join('\n');

	const listHtml =
		numbers.length > 0
			? `<ul style="margin:0 0 16px;padding-left:1.2rem;font-size:16px;line-height:1.6;">
      ${numbers
				.map((n) => {
					const label = escapeHtml(formatNational(n.e164));
					const extra = n.top_subject ? ` — ${escapeHtml(n.top_subject)}` : '';
					return `<li><a href="${links.number(n.e164)}" style="color:#0e6b66;">${label}</a> (${n.total_gov_count} complaint${n.total_gov_count === 1 ? '' : 's'}${extra})</li>`;
				})
				.join('\n')}
    </ul>`
			: `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;">We do not have a fresh top-number list to share this week. You can check the <a href="${links.data}" style="color:#0e6b66;">live spam-call data index</a> any time.</p>`;

	const html = emailShell(
		subject,
		`<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">${escapeHtml(subject)}</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(intro)}</p>
    ${listHtml}
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
      <a href="${links.data}" style="color:#0e6b66;">Live spam-call data</a>
      · <a href="${links.report}" style="color:#0e6b66;">Report a number</a>
      · <a href="${links.block}" style="color:#0e6b66;">Block spam calls</a>
      ${areaCode ? `· <a href="${links.area(areaCode)}" style="color:#0e6b66;">Area code ${escapeHtml(areaCode)}</a>` : ''}
    </p>
    <p style="margin:0;font-size:16px;line-height:1.6;">Complaint counts come from official FTC and FCC records we ingest. They are not a verified identification of the caller.</p>`,
		email
	);
	return { subject, text, html };
}

function settlementAlertContent(email: string, settlement: Settlement): EmailContent {
	const links = toolLinks();
	const deadline = formatLongDate(settlement.deadline);
	const subject = `Claim deadline ${deadline}: ${settlement.defendant}`;
	const text = [
		`A court-authorized settlement we list on NoSpamCalls has a claim deadline on ${deadline}.`,
		'',
		`Case: ${settlement.caseName}`,
		`Court: ${settlement.court}`,
		`Who may qualify: ${settlement.whoQualifies}`,
		`Payment (from the official site): ${settlement.payment}`,
		`Official settlement site: ${settlement.url}`,
		`Administrator: ${settlement.administrator}`,
		'',
		`More settlements and a TCPA evidence kit: ${links.getPaid}`,
		'',
		'This is not legal advice, and we cannot tell you whether you qualify or what you might receive. Read the official settlement website before you file a claim. Deadlines can change; rely on the official site.',
		'',
		footerText(email)
	].join('\n');
	const html = emailShell(
		subject,
		`<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">Claim deadline ${escapeHtml(deadline)}</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">A court-authorized settlement we list on NoSpamCalls has a claim deadline on ${escapeHtml(deadline)}.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
      <strong>${escapeHtml(settlement.caseName)}</strong><br />
      ${escapeHtml(settlement.court)}
    </p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;"><strong>Who may qualify:</strong> ${escapeHtml(settlement.whoQualifies)}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;"><strong>Payment (from the official site):</strong> ${escapeHtml(settlement.payment)}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Official settlement site: <a href="${escapeHtml(settlement.url)}" style="color:#0e6b66;">${escapeHtml(settlement.url)}</a><br />Administrator: ${escapeHtml(settlement.administrator)}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">See other listings and a TCPA evidence kit at <a href="${links.getPaid}" style="color:#0e6b66;">nospamcalls.org/get-paid</a>.</p>
    <p style="margin:0;font-size:16px;line-height:1.6;">This is not legal advice, and we cannot tell you whether you qualify or what you might receive. Read the official settlement website before you file a claim. Deadlines can change; rely on the official site.</p>`,
		email
	);
	return { subject, text, html };
}

export function settlementsDueSoon(now = new Date(), withinDays = 14): Settlement[] {
	const today = now.toISOString().slice(0, 10);
	const until = new Date(now.getTime() + withinDays * 86_400_000).toISOString().slice(0, 10);
	return openSettlements(now).filter((s) => s.deadline >= today && s.deadline <= until);
}
