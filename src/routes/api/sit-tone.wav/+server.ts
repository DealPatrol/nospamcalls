import type { RequestHandler } from '@sveltejs/kit';
import { buildSitWav, isSitCode } from '#lib/sit-tone';

export const GET: RequestHandler = ({ url }) => {
	const codeParam = (url.searchParams.get('code') ?? 'IC').toUpperCase();
	const code = isSitCode(codeParam) ? codeParam : 'IC';
	const repeats = Number(url.searchParams.get('repeats') ?? 1) || 1;
	const tailMs = Number(url.searchParams.get('tail') ?? 500);
	const wav = buildSitWav(code, { repeats, tailMs: Number.isFinite(tailMs) ? tailMs : 500 });
	return new Response(wav, {
		headers: {
			'Content-Type': 'audio/wav',
			'Content-Disposition': `attachment; filename="sit-tone-${code.toLowerCase()}${repeats > 1 ? `-x${Math.min(repeats, 5)}` : ''}.wav"`,
			'Cache-Control': 'public, max-age=86400, s-maxage=604800',
			'X-Robots-Tag': 'noindex'
		}
	});
};
