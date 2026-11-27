import { json } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { sqlClient } from '#lib/server/db';
import { sha256 } from '#lib/server/appstore';
import { burnerBaseUrl, monthlyMinuteCap, twilioRequest, type TwilioConfig } from '#lib/server/twilio';

export type BurnerRow = {
	id: string;
	install_id: string;
	token_hash: string;
	original_transaction_id: string;
	subscription_product_id: string;
	twilio_sid: string | null;
	phone_number: string;
	area_code: string | null;
	forward_to_number: string | null;
	screening_mode: 'forward' | 'voicemail';
	status: 'active' | 'released';
	monthly_minutes_used: number;
	usage_month: string;
	created_at: string;
	updated_at: string;
	expires_at: string;
};

export const notConfigured = () =>
	json(
		{ error: 'not_configured', message: 'Burner numbers are not available yet. Please try again later.' },
		{ status: 503, headers: { 'Cache-Control': 'no-store' } }
	);
export const fail = (status: number, error: string, message: string) => json({ error, message }, { status, headers: { 'Cache-Control': 'no-store' } });

export const validInstallId = (s: unknown): s is string => typeof s === 'string' && /^[A-Za-z0-9-]{16,64}$/.test(s);
export const validAreaCode = (s: unknown): s is string => typeof s === 'string' && /^[2-9]\d{2}$/.test(s) && !/^[2-9]11$/.test(s);
/** US/NANP E.164 only: +1 NXX NXX XXXX */
export function usE164(s: unknown): string | null {
	if (typeof s !== 'string') return null;
	const d = s.replace(/\D/g, '');
	const ten = d.length === 11 && d.startsWith('1') ? d.slice(1) : d.length === 10 ? d : null;
	if (!ten || !/^[2-9]\d{2}[2-9]\d{6}$/.test(ten) || /^[2-9]11/.test(ten)) return null;
	return '+1' + ten;
}

export const newToken = () => randomBytes(32).toString('base64url');
export const currentMonth = () => new Date().toISOString().slice(0, 7);

/** Finds the caller's active number using installId + bearer token (issued once at provisioning). */
export async function authedBurner(request: Request, installId: unknown): Promise<BurnerRow | null> {
	if (!validInstallId(installId)) return null;
	const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
	if (token.length < 20) return null;
	const sql = sqlClient();
	const rows = (await sql`SELECT * FROM burner_numbers WHERE install_id = ${installId} AND status = 'active' AND token_hash = ${sha256(token)} LIMIT 1`) as BurnerRow[];
	return rows[0] ?? null;
}

export function publicBurner(b: BurnerRow) {
	const month = currentMonth();
	return {
		phoneNumber: b.phone_number,
		areaCode: b.area_code,
		forwardTo: b.forward_to_number,
		screeningMode: b.screening_mode,
		status: b.status,
		createdAt: b.created_at,
		expiresAt: b.expires_at,
		usage: { month, minutesUsed: b.usage_month === month ? b.monthly_minutes_used : 0, minutesCap: monthlyMinuteCap() }
	};
}

type Available = { available_phone_numbers: { phone_number: string }[] };
type Incoming = { sid: string; phone_number: string };

/** Buys one US local number (preferring the requested area code) wired to our voice/SMS webhooks. */
export async function buyNumber(cfg: TwilioConfig, areaCode: string | null): Promise<{ sid: string; phoneNumber: string; areaCode: string }> {
	const search = async (params: Record<string, string>) =>
		(await twilioRequest<Available>(cfg, 'GET', '/AvailablePhoneNumbers/US/Local.json', { VoiceEnabled: 'true', SmsEnabled: 'true', PageSize: '5', ...params }))
			.available_phone_numbers ?? [];
	let found = areaCode ? await search({ AreaCode: areaCode }) : [];
	if (found.length === 0) found = await search({});
	if (found.length === 0) throw new Error('No US numbers are available right now.');
	const base = burnerBaseUrl();
	const bought = await twilioRequest<Incoming>(cfg, 'POST', '/IncomingPhoneNumbers.json', {
		PhoneNumber: found[0].phone_number,
		FriendlyName: 'NoSpamCalls burner',
		VoiceUrl: `${base}/api/burner/voice`,
		VoiceMethod: 'POST',
		SmsUrl: `${base}/api/burner/sms`,
		SmsMethod: 'POST'
	});
	return { sid: bought.sid, phoneNumber: bought.phone_number, areaCode: bought.phone_number.slice(2, 5) };
}

/** Releases the Twilio number, deletes stored recordings, texts and voicemails, and marks the row released. */
export async function releaseBurner(cfg: TwilioConfig, b: BurnerRow): Promise<void> {
	const sql = sqlClient();
	if (b.twilio_sid) await twilioRequest(cfg, 'DELETE', `/IncomingPhoneNumbers/${encodeURIComponent(b.twilio_sid)}.json`);
	const vms = (await sql`SELECT recording_sid FROM burner_voicemails WHERE burner_id = ${b.id}`) as { recording_sid: string | null }[];
	for (const v of vms) {
		if (v.recording_sid) await twilioRequest(cfg, 'DELETE', `/Recordings/${encodeURIComponent(v.recording_sid)}.json`).catch(() => null);
	}
	await sql`DELETE FROM burner_voicemails WHERE burner_id = ${b.id}`;
	await sql`DELETE FROM burner_messages WHERE burner_id = ${b.id}`;
	await sql`UPDATE burner_numbers SET status = 'released', released_at = now(), updated_at = now(), forward_to_number = NULL WHERE id = ${b.id}`;
}

/** Creates an active burner row (number already purchased). Returns the one-time app token. */
export async function insertBurner(args: {
	installId: string;
	originalTransactionId: string;
	productId: string;
	expiresAt: Date;
	sid: string;
	phoneNumber: string;
	areaCode: string;
	forwardTo: string;
	mode: 'forward' | 'voicemail';
}): Promise<{ row: BurnerRow; token: string }> {
	const token = newToken();
	const sql = sqlClient();
	const rows = (await sql`
		INSERT INTO burner_numbers (install_id, token_hash, original_transaction_id, subscription_product_id, twilio_sid, phone_number, area_code, forward_to_number, screening_mode, expires_at)
		VALUES (${args.installId}, ${sha256(token)}, ${args.originalTransactionId}, ${args.productId}, ${args.sid}, ${args.phoneNumber}, ${args.areaCode}, ${args.forwardTo}, ${args.mode}, ${args.expiresAt.toISOString()})
		RETURNING *`) as BurnerRow[];
	return { row: rows[0], token };
}

/** Adds call minutes to this month's usage (resetting at the start of each UTC month). */
export async function addMinutes(id: string, seconds: number) {
	const minutes = Math.max(0, Math.ceil(seconds / 60));
	if (!minutes) return;
	const month = currentMonth();
	const sql = sqlClient();
	await sql`UPDATE burner_numbers SET
		monthly_minutes_used = CASE WHEN usage_month = ${month} THEN monthly_minutes_used + ${minutes} ELSE ${minutes} END,
		usage_month = ${month}, updated_at = now() WHERE id = ${id}`;
}

export async function burnerByNumber(to: string): Promise<BurnerRow | null> {
	const sql = sqlClient();
	const rows = (await sql`SELECT * FROM burner_numbers WHERE phone_number = ${to} AND status = 'active' LIMIT 1`) as BurnerRow[];
	return rows[0] ?? null;
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
	try {
		const b = await request.json();
		return b && typeof b === 'object' ? (b as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}
