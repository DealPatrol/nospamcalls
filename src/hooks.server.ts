import type { Handle } from '@sveltejs/kit/hooks';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.hostname === 'nospamcalls.vercel.app') {
		const destination = `https://nospamcalls.org${event.url.pathname}${event.url.search}`;
		// 301 for GET/HEAD so search engines transfer ranking. 308 for other
		// methods so POST/API requests are not converted to GET.
		const method = event.request.method.toUpperCase();
		const status = method === 'GET' || method === 'HEAD' ? 301 : 308;
		return new Response(null, {
			status,
			headers: { location: destination }
		});
	}

	return resolve(event);
};
