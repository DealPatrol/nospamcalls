import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.hostname === 'nospamcalls.vercel.app') {
		const destination = `https://nospamcalls.org${event.url.pathname}${event.url.search}`;
		// 301 for GET/HEAD so search engines transfer ranking. 308 for other
		// methods so POST/API requests are not converted to GET.
		const method = event.request.method.toUpperCase();
		redirect(method === 'GET' || method === 'HEAD' ? 301 : 308, destination);
	}

	return resolve(event);
};
