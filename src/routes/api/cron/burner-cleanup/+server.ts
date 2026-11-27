import { json, type RequestHandler } from '@sveltejs/kit';
import { cronUnauthorized } from '#lib/server/cron-auth';
import { twilioConfig } from '#lib/server/twilio';
import { releaseBurner, type BurnerRow } from '#lib/server/burner';
import { sqlClient } from '#lib/server/db';

const GRACE_DAYS = 3;

/** Daily: releases burner numbers whose subscription ended more than GRACE_DAYS ago (stops Twilio charges, deletes data). */
export const GET: RequestHandler = async ({ request }) => {
	const denied = cronUnauthorized(request);
	if (denied) return denied;
	const cfg = twilioConfig();
	if (!cfg) return json({ ok: true, skipped: 'not_configured' });
	const sql = sqlClient();
	const due = (await sql`SELECT * FROM burner_numbers WHERE status = 'active' AND expires_at < now() - make_interval(days => ${GRACE_DAYS}) LIMIT 50`) as BurnerRow[];
	let released = 0;
	for (const b of due) {
		try {
			await releaseBurner(cfg, b);
			released++;
		} catch (e) {
			console.error('burner cleanup failed for one number', (e as Error).message);
		}
	}
	return json({ ok: true, due: due.length, released });
};
