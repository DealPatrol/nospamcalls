import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { unsubscribeByToken, verifyUnsubscribeToken } from '#lib/server/email';

function tokenFrom(event: { url: URL; request: Request }, form?: FormData | null): string {
	const fromQuery = event.url.searchParams.get('token');
	if (fromQuery) return fromQuery;
	if (form) {
		const fromForm = form.get('token');
		if (typeof fromForm === 'string' && fromForm) return fromForm;
	}
	return '';
}

export const GET: RequestHandler = async (event) => {
	const token = event.url.searchParams.get('token');
	if (!token || !verifyUnsubscribeToken(token)) {
		return json({ error: 'Missing or invalid unsubscribe token.' }, { status: 400 });
	}
	redirect(302, `/unsubscribe?token=${encodeURIComponent(token)}`);
};

export const POST: RequestHandler = async (event) => {
	const contentType = event.request.headers.get('content-type') ?? '';
	let form: FormData | null = null;
	if (
		contentType.includes('application/x-www-form-urlencoded') ||
		contentType.includes('multipart/form-data')
	) {
		form = await event.request.formData().catch(() => null);
	} else if (contentType.includes('application/json')) {
		const body = (await event.request.json().catch(() => null)) as { token?: unknown } | null;
		if (body && typeof body.token === 'string') {
			form = new FormData();
			form.set('token', body.token);
		}
	}
	const token = tokenFrom(event, form);
	const result = await unsubscribeByToken(token);
	if (!result.ok) {
		return json({ error: 'Missing or invalid unsubscribe token.' }, { status: 400 });
	}
	return json({ ok: true });
};
