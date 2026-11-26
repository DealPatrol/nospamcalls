import type { RequestHandler } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import { sqlClient } from '#lib/server/db';
import { toNanpInt } from '#lib/nanp';

/**
 * Compact feed for the NoSpamCalls iOS Call Directory extension.
 * Every number with at least one FCC/FTC complaint, as an 11-digit NANP integer
 * (1 + NPA + NXX + XXXX), deduplicated and strictly ascending, which is the order
 * CXCallDirectoryExtensionContext requires.
 */
const FORMAT_VERSION = 1;
const CACHE = 'public, max-age=3600, s-maxage=21600';

export const GET: RequestHandler = async ({ request }) => {
	let rows: { e164: string }[];
	let updatedAt: string | null = null;
	try {
		const sql = sqlClient();
		const [list, meta] = await Promise.all([
			sql`SELECT e164 FROM gov_spam_numbers WHERE total_gov_count > 0`,
			sql`SELECT max(updated_at) AS updated_at FROM gov_spam_numbers`
		]);
		rows = list as { e164: string }[];
		const u = (meta[0] as { updated_at: unknown } | undefined)?.updated_at;
		updatedAt = u ? new Date(String(u)).toISOString() : null;
	} catch (err) {
		console.error('call-directory feed failed', err);
		return new Response(JSON.stringify({ error: 'Spam data is temporarily unavailable.' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': '300' }
		});
	}

	const set = new Set<number>();
	for (const r of rows) {
		const n = toNanpInt(r.e164);
		if (n !== null) set.add(n);
	}
	const numbers = [...set].sort((a, b) => a - b);

	const etag = `"cd${FORMAT_VERSION}-${createHash('sha1').update(numbers.join(',')).digest('hex').slice(0, 20)}"`;
	const headers: Record<string, string> = {
		'Content-Type': 'application/json; charset=utf-8',
		'Cache-Control': CACHE,
		ETag: etag,
		'X-Robots-Tag': 'noindex',
		'Access-Control-Allow-Origin': '*'
	};
	const inm = request.headers.get('if-none-match');
	if (inm && inm.split(',').some((t) => t.trim().replace(/^W\//, '') === etag)) {
		return new Response(null, { status: 304, headers });
	}

	const body = JSON.stringify({
		format: FORMAT_VERSION,
		version: etag.slice(1, -1),
		updatedAt,
		source: 'FCC Consumer Complaints + FTC Do Not Call reports via nospamcalls.org',
		count: numbers.length,
		numbers
	});
	return new Response(body, { headers });
};
