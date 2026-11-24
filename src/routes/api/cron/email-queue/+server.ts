import { json, type RequestHandler } from '@sveltejs/kit';
import { cronUnauthorized } from '#lib/server/cron-auth';
import { isEmailConfigured } from '#lib/server/email';
import { runEmailQueue } from '#lib/server/email-jobs';

export const config = { maxDuration: 60 };

export const GET: RequestHandler = async ({ request }) => {
	const denied = cronUnauthorized(request);
	if (denied) return denied;
	if (!isEmailConfigured()) {
		return json({ ok: true, skipped: true, reason: 'not_configured' });
	}
	try {
		const result = await runEmailQueue();
		return json({ ok: true, ...result });
	} catch (err) {
		console.error('email-queue cron failed', err);
		return json({ ok: false, error: 'Email queue failed' }, { status: 500 });
	}
};
