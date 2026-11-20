import { absoluteUrl } from '#lib/site';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async () => {
	const body = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;
	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
