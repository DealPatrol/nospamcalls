import { json, type RequestHandler } from '@sveltejs/kit';
import { cronUnauthorized } from '#lib/server/cron-auth';
import { isEmailConfigured } from '#lib/server/email';
import { runWeeklyDigests } from '#lib/server/email-jobs';

export const config = { maxDuration: 60 };

export const GET: RequestHandler = async ({ request }) => {
	const denied = cronUnauthorized(request);
	if (denied) return denied;
	if (!isEmailConfigured()) {
		return json({ ok: true, skipped: true, reason: 'not_configured' });
	}
	try {
		const digests = await runWeeklyDigests();
		return json({ ok: true, digests });
	} catch (err) {
		console.error('weekly-digest cron failed', err);
		return json({ ok: false, error: 'Weekly digest failed' }, { status: 500 });
	}
};
