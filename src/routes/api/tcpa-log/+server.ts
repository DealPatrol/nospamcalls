import { json, type RequestHandler } from '@sveltejs/kit';
import { addEvidence, listEvidence, removeEvidence } from '#lib/server/accounts';
import { allowAction, emailAccountKey, isAccountKey, mergeAccount } from '#lib/server/db';
import { normalizeToE164, slugToE164 } from '#lib/phone';
import { hashIp, normalizeEmail } from '#lib/security';

function clip(value: unknown, max: number): string | null {
	if (typeof value !== 'string') return null;
	const v = value.replace(/\s+/g, ' ').trim();
	return v ? v.slice(0, max) : null;
}

export const GET: RequestHandler = async ({ url }) => {
	const key = url.searchParams.get('key');
	if (!isAccountKey(key)) return json({ error: 'Missing or invalid key.' }, { status: 400 });
	return json({ key, logs: await listEvidence(key) });
};

export const POST: RequestHandler = async (event) => {
	const body = (await event.request.json().catch(() => ({}))) as Record<string, unknown>;
	if (typeof body.website === 'string' && body.website.trim()) return json({ ok: true });
	let key = isAccountKey(body.key) ? body.key : null;
	const email = typeof body.email === 'string' && body.email.trim() ? normalizeEmail(body.email) : null;
	if (email) {
		const emailKey = emailAccountKey(email);
		if (key) await mergeAccount(key, emailKey);
		key = emailKey;
	}
	if (!key) return json({ error: 'Missing key. Refresh and try again.' }, { status: 400 });

	const raw = String(body.number ?? '');
	const e164 = normalizeToE164(raw) ?? slugToE164(raw);
	if (!e164) return json({ error: 'Enter the number that called or texted you.' }, { status: 400 });

	let occurred = new Date(String(body.occurredAt ?? ''));
	if (Number.isNaN(occurred.getTime())) occurred = new Date();
	if (occurred.getTime() > Date.now() + 86400000) {
		return json({ error: 'The date cannot be in the future.' }, { status: 400 });
	}

	if (!(await allowAction(hashIp(event.getClientAddress()), 'tcpa_log', 60))) {
		return json({ error: 'Too many entries from this network. Try again in an hour.' }, { status: 429 });
	}

	await addEvidence(key, {
		e164,
		occurred_at: occurred.toISOString(),
		call_or_text: body.callOrText === 'text' ? 'text' : 'call',
		company_name: clip(body.companyName, 160),
		company_contact: clip(body.companyContact, 200),
		used_automated: body.usedAutomated !== false,
		on_dnc_31_days: body.onDnc === true,
		revoked_consent_at: clip(body.revokedConsentAt, 40),
		summary: clip(body.summary, 1000)
	});
	return json({ ok: true, key, logs: await listEvidence(key) });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
	if (!isAccountKey(body.key)) return json({ error: 'Missing key.' }, { status: 400 });
	const id = Number(body.id);
	if (!Number.isInteger(id) || id <= 0) return json({ error: 'Invalid entry.' }, { status: 400 });
	await removeEvidence(body.key, id);
	return json({ ok: true, logs: await listEvidence(body.key) });
};
