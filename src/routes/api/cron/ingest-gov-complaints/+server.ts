import { json, type RequestHandler } from '@sveltejs/kit';
import { ingestGovComplaints } from '#lib/server/gov';

export const config = { maxDuration: 60 };

export const GET: RequestHandler = async ({ request }) => {
	const secret = process.env.CRON_SECRET;
	if (secret) {
		const auth = request.headers.get('authorization');
		if (auth !== `Bearer ${secret}`) return json({ error: 'Unauthorized' }, { status: 401 });
	} else if (!request.headers.get('x-vercel-cron') && !request.headers.get('user-agent')?.includes('vercel-cron')) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const result = await ingestGovComplaints({ days: 3, fccLimit: 5000, ftcPages: 4 });
		return json({ ok: true, ...result });
	} catch (err) {
		console.error('gov ingest failed', err);
		return json({ ok: false, error: 'Ingest failed' }, { status: 500 });
	}
};
