import type { RequestHandler } from '@sveltejs/kit';
import { listBlocklist } from '#lib/server/accounts';
import { isAccountKey } from '#lib/server/db';
import { topGovNumbers } from '#lib/server/gov';
import { buildBlocklistVcard } from '#lib/vcard';

export const GET: RequestHandler = async ({ url }) => {
	const key = url.searchParams.get('key');
	const includeTop = url.searchParams.get('includeTop') !== '0' && (url.searchParams.has('includeTop') || !isAccountKey(key));
	const numbers: string[] = [];
	if (isAccountKey(key)) numbers.push(...(await listBlocklist(key)).map((n) => n.e164));
	if (includeTop) numbers.push(...(await topGovNumbers(100, 30, 2)).map((n) => n.e164));
	const body = buildBlocklistVcard(numbers);
	return new Response(body, {
		headers: {
			'Content-Type': 'text/vcard; charset=utf-8',
			'Content-Disposition': 'attachment; filename="nospamcalls-blocklist.vcf"',
			'Cache-Control': isAccountKey(key) ? 'private, no-store' : 'public, max-age=0, s-maxage=3600',
			'X-Robots-Tag': 'noindex'
		}
	});
};
