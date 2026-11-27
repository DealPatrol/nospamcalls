import type { Handle } from '@sveltejs/kit/hooks';

/** Form-POST routes called server-to-server by Twilio (verified with X-Twilio-Signature in each route). */
const SIGNED_WEBHOOKS = new Set(['/api/burner/voice', '/api/burner/sms', '/api/burner/voicemail-callback']);
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const FORM_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];

/** Same rule as SvelteKit's built-in CSRF check: cross-site form submissions are rejected. */
function csrfForbidden(request: Request, url: URL): boolean {
	if (!MUTATING.has(request.method.toUpperCase()) || SIGNED_WEBHOOKS.has(url.pathname)) return false;
	const type = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
	if (type && !FORM_TYPES.includes(type)) return false;
	return request.headers.get('origin') !== url.origin;
}

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

	if (csrfForbidden(event.request, event.url)) {
		const message = `Cross-site ${event.request.method} form submissions are forbidden`;
		return event.request.headers.get('accept') === 'application/json'
			? Response.json({ message }, { status: 403 })
			: new Response(message, { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
	}

	const response = await resolve(event);
	if (event.url.pathname === '/unsubscribe') {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}
	return response;
};
