import { json, type RequestHandler } from '@sveltejs/kit';
import { listOptout, setOptout } from '#lib/server/accounts';
import { isAccountKey } from '#lib/server/db';
import { BROKERS } from '#lib/content/brokers';

const STATUSES = ['todo', 'requested', 'removed'];
const SLUGS = new Set(BROKERS.map((b) => b.slug));

export const GET: RequestHandler = async ({ url }) => {
	const key = url.searchParams.get('key');
	if (!isAccountKey(key)) return json({ error: 'Missing or invalid key.' }, { status: 400 });
	return json({ key, progress: await listOptout(key) });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
	const key = isAccountKey(body.key) ? body.key : null;
	if (!key) return json({ error: 'Missing key.' }, { status: 400 });
	const updates: [string, string][] = [];
	if (typeof body.broker === 'string' && typeof body.status === 'string') updates.push([body.broker, body.status]);
	if (body.progress && typeof body.progress === 'object') {
		for (const [slug, status] of Object.entries(body.progress as Record<string, unknown>)) {
			if (typeof status === 'string') updates.push([slug, status]);
		}
	}
	for (const [slug, status] of updates.slice(0, 50)) {
		if (SLUGS.has(slug) && STATUSES.includes(status)) await setOptout(key, slug, status);
	}
	return json({ ok: true, key, progress: await listOptout(key) });
};
