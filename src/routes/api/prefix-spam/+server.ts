import { json, type RequestHandler } from '@sveltejs/kit';
import { prefixSpam, validNpa, validNxx } from '#lib/server/prefix';

export const GET: RequestHandler = async ({ url }) => {
	const npa = validNpa(url.searchParams.get('npa'));
	const nxxRaw = url.searchParams.get('nxx');
	const nxx = nxxRaw ? validNxx(nxxRaw) : null;
	if (!npa) return json({ error: 'Enter a valid 3-digit U.S. area code (it can’t start with 0 or 1).' }, { status: 400 });
	if (nxxRaw && !nxx) return json({ error: 'Enter a valid 3-digit prefix (it can’t start with 0 or 1).' }, { status: 400 });
	try {
		const result = await prefixSpam(npa, nxx, 100);
		return json({ result }, { headers: { 'cache-control': 'public, max-age=0, s-maxage=3600', 'x-robots-tag': 'noindex' } });
	} catch (err) {
		console.error('prefix spam query failed', err);
		return json({ error: 'Spam data is temporarily unavailable. Try again shortly.' }, { status: 503 });
	}
};
