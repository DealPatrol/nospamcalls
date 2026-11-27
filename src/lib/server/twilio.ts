import { createHmac, timingSafeEqual } from 'node:crypto';

/** Minimal Twilio REST client over fetch (no SDK). Credentials come only from env vars and are never logged. */
export type TwilioConfig = { accountSid: string; authToken: string };

export function twilioConfig(): TwilioConfig | null {
	const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
	const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
	if (!accountSid || !authToken) return null;
	return { accountSid, authToken };
}

/** Public base URL Twilio calls back on (must match what Twilio signs). */
export const burnerBaseUrl = () => (process.env.BURNER_PUBLIC_BASE_URL?.trim() || 'https://nospamcalls.org').replace(/\/$/, '');
export const monthlyMinuteCap = () => {
	const n = Number(process.env.BURNER_MONTHLY_MINUTES ?? 250);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : 250;
};

export class TwilioError extends Error {
	constructor(
		message: string,
		public status: number,
		public code?: number
	) {
		super(message);
	}
}

export async function twilioRequest<T>(cfg: TwilioConfig, method: 'GET' | 'POST' | 'DELETE', path: string, params?: Record<string, string>): Promise<T> {
	const base = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(cfg.accountSid)}`;
	let url = `${base}${path}`;
	const init: RequestInit = {
		method,
		headers: { Authorization: 'Basic ' + Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString('base64') }
	};
	if (params && method === 'GET') url += '?' + new URLSearchParams(params).toString();
	if (params && method === 'POST') {
		init.body = new URLSearchParams(params).toString();
		(init.headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
	}
	const res = await fetch(url, init);
	if (method === 'DELETE' && (res.status === 204 || res.status === 404)) return undefined as T;
	const text = await res.text();
	let data: { message?: string; code?: number } = {};
	try {
		data = text ? JSON.parse(text) : {};
	} catch {
		/* non-JSON error body */
	}
	if (!res.ok) throw new TwilioError(data.message ?? `Twilio request failed (${res.status})`, res.status, data.code);
	return data as T;
}

/** Streams a Twilio-hosted media file (voicemail recordings require account auth). */
export function twilioMediaFetch(cfg: TwilioConfig, url: string): Promise<Response> {
	if (!/^https:\/\/api\.twilio\.com\//.test(url)) throw new TwilioError('Unexpected media host', 400);
	return fetch(url, { headers: { Authorization: 'Basic ' + Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString('base64') } });
}

/**
 * X-Twilio-Signature check: base64(HMAC-SHA1(authToken, fullUrl + sorted POST params as key+value)).
 * https://www.twilio.com/docs/usage/security#validating-requests
 */
export function validTwilioSignature(authToken: string, signature: string | null, fullUrl: string, params: Record<string, string>): boolean {
	if (!signature) return false;
	const data = fullUrl + Object.keys(params).sort().map((k) => k + params[k]).join('');
	const expected = createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64');
	const a = Buffer.from(expected);
	const b = Buffer.from(signature);
	return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Reads a Twilio webhook: parses the form body and, when an auth token is configured, rejects bad signatures.
 * The URL Twilio signed is our public base URL (or the request's own origin) + the path and query string.
 */
export async function readTwilioWebhook(request: Request, url: URL): Promise<{ params: Record<string, string>; ok: boolean }> {
	const form = await request.formData();
	const params: Record<string, string> = {};
	for (const [k, v] of form.entries()) if (typeof v === 'string') params[k] = v;
	const cfg = twilioConfig();
	if (!cfg) return { params, ok: false };
	const sig = request.headers.get('x-twilio-signature');
	const tail = url.pathname + url.search;
	// Twilio signs the exact URL it called: normally our configured public base, else the host the request arrived on.
	const candidates = new Set([burnerBaseUrl() + tail, url.origin + tail]);
	const ok = [...candidates].some((u) => validTwilioSignature(cfg.authToken, sig, u, params));
	return { params, ok };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const xmlAttr = esc;
export function twiml(inner: string): Response {
	return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`, {
		headers: { 'Content-Type': 'text/xml; charset=utf-8', 'Cache-Control': 'no-store' }
	});
}
