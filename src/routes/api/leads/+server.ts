import { json, type RequestHandler } from '@sveltejs/kit';
import { incrementSiteEvent } from '#lib/db';
import { allowAction } from '#lib/server/db';
import { insertLead, LEAD_MAGNETS, type LeadMagnet } from '#lib/server/leads';
import { sendWelcomeEmail, syncResendContact, markLeadEmailResult } from '#lib/server/email';
import { PRO_FEATURE_IDS } from '#lib/content/pro';
import { hashIp, normalizeEmail } from '#lib/security';

const STRICT_EMAIL =
	/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$/;

function clip(value: unknown, max: number): string | null {
	if (typeof value !== 'string') return null;
	const v = value.replace(/[\u0000-\u001f]/g, '').trim();
	return v ? v.slice(0, max) : null;
}

async function deliverWelcome(email: string, leadId: number, needsWelcome: boolean): Promise<void> {
	try {
		if (needsWelcome) {
			await sendWelcomeEmail({ email, leadId, timeoutMs: 5_000 });
		}
		const sync = await syncResendContact(email, { unsubscribed: false }, 5_000);
		if (sync.id) await markLeadEmailResult(email, { resendContactId: sync.id });
		else if (sync.error && sync.error !== 'not_configured') {
			await markLeadEmailResult(email, { lastError: sync.error });
		}
	} catch (err) {
		console.error('welcome email or contact sync failed', err);
	}
}

export const POST: RequestHandler = async (event) => {
	const body = (await event.request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Invalid request.' }, { status: 400 });
	// Honeypot: pretend success for bots.
	if (typeof body.website === 'string' && body.website.trim()) return json({ ok: true });

	const email = normalizeEmail(String(body.email ?? ''));
	if (!email || !STRICT_EMAIL.test(email) || email.includes('..')) {
		return json({ error: 'Enter a valid email address.' }, { status: 400 });
	}
	const leadMagnet = LEAD_MAGNETS.find((m) => m === body.leadMagnet) as LeadMagnet | undefined;
	if (!leadMagnet) return json({ error: 'Unknown signup type.' }, { status: 400 });

	let sourcePath = clip(body.sourcePath, 200) ?? '/';
	if (!sourcePath.startsWith('/')) sourcePath = '/';
	const contextValue = clip(body.contextValue, 120);
	const proInterests = Array.isArray(body.proInterests)
		? [
				...new Set(
					body.proInterests.filter(
						(p): p is string => typeof p === 'string' && PRO_FEATURE_IDS.includes(p)
					)
				)
			]
		: [];

	const ipHash = hashIp(event.getClientAddress());
	try {
		if (!(await allowAction(ipHash, 'lead', 20))) {
			return json(
				{ error: 'Too many sign-ups from this network. Try again in an hour.' },
				{ status: 429 }
			);
		}
	} catch (err) {
		console.error('lead rate limit failed', err);
	}

	const result = await insertLead({
		email,
		sourcePath,
		leadMagnet,
		contextValue,
		proInterests: proInterests.length ? proInterests : null
	});
	await Promise.all([
		incrementSiteEvent(`lead:${leadMagnet}`, sourcePath),
		incrementSiteEvent('lead:all', '/'),
		...proInterests.map((p) => incrementSiteEvent(`pro_vote:${p}`, sourcePath))
	]).catch((err) => console.error('lead event failed', err));

	// Never fail the signup if Resend is slow or unavailable. Cap wait at 5s.
	if (result.needsWelcome || result.resubscribed) {
		const work = deliverWelcome(email, result.leadId, result.needsWelcome);
		await Promise.race([work, new Promise((resolve) => setTimeout(resolve, 5_000))]);
	}

	return json({ ok: true, already: result.already });
};
