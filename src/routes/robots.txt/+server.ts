import { absoluteUrl } from '#lib/site';
import type { RequestHandler } from './$types';

export const prerender = false;

// Search engines and AI answer engines are welcome. Only private API endpoints are excluded.
const AI_AND_SEARCH_BOTS = [
	'Googlebot',
	'Bingbot',
	'DuckDuckBot',
	'Applebot',
	'Applebot-Extended',
	'Google-Extended',
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'PerplexityBot',
	'Perplexity-User',
	'ClaudeBot',
	'Claude-SearchBot',
	'Claude-User',
	'anthropic-ai',
	'CCBot',
	'Amazonbot',
	'meta-externalagent',
	'cohere-ai',
	'YouBot'
];

export const GET: RequestHandler = async () => {
	const named = AI_AND_SEARCH_BOTS.map((bot) => `User-agent: ${bot}\nAllow: /\nDisallow: /api/\n`).join('\n');
	const body = `${named}
User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;
	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
