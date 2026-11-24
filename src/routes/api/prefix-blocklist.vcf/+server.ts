import type { RequestHandler } from '@sveltejs/kit';
import { prefixSpam, validNpa, validNxx } from '#lib/server/prefix';

const MAX_RANGE = 1000;

/**
 * Neighbor-spoof blocklist: one contact card holding real FTC/FCC-reported numbers that share your area code
 * (and prefix), plus an optional custom range of up to 1,000 numbers inside your own prefix.
 */
export const GET: RequestHandler = async ({ url }) => {
	const npa = validNpa(url.searchParams.get('npa'));
	const nxx = validNxx(url.searchParams.get('nxx'));
	if (!npa) return new Response('Enter a valid area code.', { status: 400 });
	const scope = url.searchParams.get('scope') === 'prefix' ? 'prefix' : 'area';

	const numbers: string[] = [];
	try {
		const r = await prefixSpam(npa, nxx, 400);
		numbers.push(...r.prefixNumbers.map((n) => n.e164));
		if (scope === 'area') numbers.push(...r.areaNumbers.map((n) => n.e164));
	} catch (err) {
		console.error('prefix vcf query failed', err);
	}

	let rangeNote = '';
	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');
	if (nxx && from && to && /^\d{4}$/.test(from) && /^\d{4}$/.test(to)) {
		const a = Number(from);
		const b = Math.min(Number(to), a + MAX_RANGE - 1);
		if (b >= a) {
			for (let i = a; i <= b; i++) numbers.push(`+1${npa}${nxx}${String(i).padStart(4, '0')}`);
			rangeNote = ` Includes custom range ${npa}-${nxx}-${from} to ${npa}-${nxx}-${String(b).padStart(4, '0')}.`;
		}
	}

	const unique = [...new Set(numbers.filter((n) => /^\+1\d{10}$/.test(n)))];
	const label = nxx ? `${npa}-${nxx}` : npa;
	const now = new Date();
	const lines = [
		'BEGIN:VCARD',
		'VERSION:3.0',
		`N:Neighbor Spoof ${label};NoSpamCalls;;;`,
		`FN:NoSpamCalls Neighbor Spoof ${label}`,
		'ORG:NoSpamCalls',
		...unique.map((n) => `TEL;TYPE=CELL:${n}`),
		`NOTE:Block this contact to block every number on it. ${unique.length} numbers reported to the FTC/FCC with area code ${npa}${nxx ? ` (prefix ${nxx} first)` : ''}.${rangeNote} Updated ${now.toISOString().slice(0, 10)} from nospamcalls.org/neighbor-spoof.`,
		`REV:${now.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
		'END:VCARD'
	];
	return new Response(lines.join('\r\n') + '\r\n', {
		headers: {
			'Content-Type': 'text/vcard; charset=utf-8',
			'Content-Disposition': `attachment; filename="nospamcalls-neighbor-spoof-${label}.vcf"`,
			'Cache-Control': 'public, max-age=0, s-maxage=3600',
			'X-Robots-Tag': 'noindex'
		}
	});
};
