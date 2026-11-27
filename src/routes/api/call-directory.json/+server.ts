import type { RequestHandler } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import { sqlClient } from '#lib/server/db';
import { toNanpInt } from '#lib/nanp';

/**
 * Two-tier feed for the NoSpamCalls iOS Call Directory extension (format 2).
 *  - blocked: numbers with repeated FCC/FTC complaints (>= BLOCK_THRESHOLD) — the app blocks these.
 *  - labeled: numbers with a single complaint — the app lets them ring, labeled "Reported spam".
 * Each list is 11-digit NANP integers (1 + NPA + NXX + XXXX), deduplicated and strictly ascending,
 * the order CXCallDirectoryExtensionContext requires. A number never appears in both lists.
 */
const FORMAT_VERSION = 2;
const BLOCK_THRESHOLD = 2;
const CACHE = 'public, max-age=3600, s-maxage=21600';

export const GET: RequestHandler = async ({ request }) => {
	let rows: { e164: string; total_gov_count: number }[];
	let updatedAt: string | null = null;
	try {
		const sql = sqlClient();
		const [list, meta] = await Promise.all([
			sql`SELECT e164, total_gov_count FROM gov_spam_numbers WHERE total_gov_count > 0`,
			sql`SELECT max(updated_at) AS updated_at FROM gov_spam_numbers`
		]);
		rows = list as { e164: string; total_gov_count: number }[];
		const u = (meta[0] as { updated_at: unknown } | undefined)?.updated_at;
		updatedAt = u ? new Date(String(u)).toISOString() : null;
	} catch (err) {
		console.error('call-directory feed failed', err);
		return new Response(JSON.stringify({ error: 'Spam data is temporarily unavailable.' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': '300' }
		});
	}

	// Several e164 spellings can map to one integer; keep the highest complaint count.
	const counts = new Map<number, number>();
	for (const r of rows) {
		const n = toNanpInt(r.e164);
		if (n === null) continue;
		const c = Number(r.total_gov_count) || 0;
		counts.set(n, Math.max(counts.get(n) ?? 0, c));
	}
	const blocked: number[] = [];
	const labeled: number[] = [];
	for (const [n, c] of counts) (c >= BLOCK_THRESHOLD ? blocked : labeled).push(n);
	blocked.sort((a, b) => a - b);
	labeled.sort((a, b) => a - b);

	const digest = createHash('sha1').update(`${BLOCK_THRESHOLD}|${blocked.join(',')}|${labeled.join(',')}`).digest('hex').slice(0, 20);
	const etag = `"cd${FORMAT_VERSION}-${digest}"`;
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
		threshold: BLOCK_THRESHOLD,
		counts: { blocked: blocked.length, labeled: labeled.length },
		blocked,
		labeled
	});
	return new Response(body, { headers });
};
