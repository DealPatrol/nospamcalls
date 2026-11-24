import { json, type RequestHandler } from '@sveltejs/kit';
import { addToBlocklist, listBlocklist, removeFromBlocklist } from '#lib/server/accounts';
import { allowAction, emailAccountKey, isAccountKey, mergeAccount } from '#lib/server/db';
import { insertReport, incrementSiteEvent } from '#lib/db';
import { isCategory, type CategoryId } from '#lib/categories';
import { normalizeToE164, slugToE164 } from '#lib/phone';
import { hashIp, normalizeEmail, sanitizeComment } from '#lib/security';

const CALL_TYPES = ['robocall', 'scam', 'telemarketer', 'debt_collector', 'other'] as const;

function clip(value: unknown, max: number): string | null {
	if (typeof value !== 'string') return null;
	const v = value.replace(/\s+/g, ' ').trim();
	return v ? v.slice(0, max) : null;
}

export const GET: RequestHandler = async ({ url }) => {
	const key = url.searchParams.get('key');
	if (!isAccountKey(key)) return json({ error: 'Missing or invalid list key.' }, { status: 400 });
	return json({ key, numbers: await listBlocklist(key) });
};

export const POST: RequestHandler = async (event) => {
	const body = (await event.request.json().catch(() => ({}))) as Record<string, unknown>;
	if (typeof body.website === 'string' && body.website.trim()) return json({ ok: true });

	let key = isAccountKey(body.key) ? body.key : null;
	const email = typeof body.email === 'string' && body.email.trim() ? normalizeEmail(body.email) : null;
	if (typeof body.email === 'string' && body.email.trim() && !email) {
		return json({ error: 'That email address does not look right.' }, { status: 400 });
	}
	if (email) {
		const emailKey = emailAccountKey(email);
		if (key) await mergeAccount(key, emailKey);
		key = emailKey;
	}
	if (!key) return json({ error: 'Missing list key. Refresh the page and try again.' }, { status: 400 });

	const raw = String(body.number ?? '');
	const e164 = normalizeToE164(raw) ?? slugToE164(raw);
	if (!e164) return json({ error: 'Enter a valid phone number, including area code.' }, { status: 400 });

	const callType = CALL_TYPES.includes(body.callType as (typeof CALL_TYPES)[number])
		? (body.callType as string)
		: 'robocall';
	const note = clip(body.note, 300);
	const label = clip(body.company, 120);

	const ipHash = hashIp(event.getClientAddress());
	if (!(await allowAction(ipHash, 'blocklist_add', 40))) {
		return json({ error: 'Too many numbers added from this network. Try again in an hour.' }, { status: 429 });
	}

	const result = await addToBlocklist({ accountKey: key, e164, label, callType, note });

	// Also count it as a community report (the public comment only if it passes the same filter as /report).
	let reported = false;
	if (!result.already && isCategory(callType)) {
		const cleaned = sanitizeComment(note ?? '');
		const res = await insertReport({
			e164,
			category: callType as CategoryId,
			comment: cleaned.ok ? cleaned.comment : null,
			ipHash
		}).catch(() => ({ ok: false as const }));
		reported = res.ok;
	}
	await incrementSiteEvent('blocklist_add', '/api/blocklist').catch(() => {});
	return json({ ok: true, key, e164, already: result.already, reported, numbers: await listBlocklist(key) });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
	if (!isAccountKey(body.key)) return json({ error: 'Missing list key.' }, { status: 400 });
	const e164 = typeof body.e164 === 'string' ? slugToE164(body.e164) : null;
	if (!e164) return json({ error: 'Invalid number.' }, { status: 400 });
	await removeFromBlocklist(body.key, e164);
	return json({ ok: true, numbers: await listBlocklist(body.key) });
};
