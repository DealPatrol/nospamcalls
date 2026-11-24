import { json } from '@sveltejs/kit';

/** Returns a 401 response when the cron bearer token is missing or invalid. */
export function cronUnauthorized(request: Request): Response | null {
	const secret = process.env.CRON_SECRET;
	const auth = request.headers.get('authorization');
	if (!secret || auth !== `Bearer ${secret}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	return null;
}
