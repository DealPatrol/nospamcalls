import { json, type RequestHandler } from '@sveltejs/kit';
import { incrementSiteEvent, insertEmailSignup, insertWaitlist } from '#lib/db';
import { hashIp, normalizeEmail } from '#lib/security';

const KINDS = ['founding_plan', 'tcpa_settlements'] as const;

export const POST: RequestHandler = async (event) => {
	const body = (await event.request.json().catch(() => ({}))) as Record<string, unknown>;
	if (typeof body.website === 'string' && body.website.trim()) return json({ ok: true });
	const kind = KINDS.find((k) => k === body.kind);
	if (!kind) return json({ error: 'Unknown signup type.' }, { status: 400 });
	const email = normalizeEmail(String(body.email ?? ''));
	if (!email) return json({ error: 'Enter a valid email address.' }, { status: 400 });
	const ipHash = hashIp(event.getClientAddress());
	const sourcePath = typeof body.sourcePath === 'string' ? body.sourcePath.slice(0, 200) : null;
	const result = await insertEmailSignup({ email, kind, sourcePath, ipHash });
	if (!result.ok) return json({ error: result.error }, { status: 429 });
	if (kind === 'founding_plan') await insertWaitlist({ email, type: 'app', ipHash }).catch(() => null);
	await incrementSiteEvent(`signup_${kind}`, sourcePath ?? '/').catch(() => {});
	return json({ ok: true, already: result.already });
};
