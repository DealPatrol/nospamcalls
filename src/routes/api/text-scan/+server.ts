import { json, type RequestHandler } from '@sveltejs/kit';
import { allowAction } from '#lib/server/db';
import { scanText } from '#lib/server/text-scan';
import { hashIp } from '#lib/security';

export const config = { maxDuration: 20 };

// The pasted message is analyzed in memory only and is never written to the database or logs.
export const POST: RequestHandler = async (event) => {
	const body = (await event.request.json().catch(() => null)) as Record<string, unknown> | null;
	const message = typeof body?.message === 'string' ? body.message.trim() : '';
	const sender = typeof body?.sender === 'string' ? body.sender : null;
	if (!message || message.length < 4) {
		return json({ error: 'Paste the text message you received.' }, { status: 400 });
	}
	if (message.length > 5000) {
		return json({ error: 'That message is too long. Paste up to 5,000 characters.' }, { status: 400 });
	}
	try {
		if (!(await allowAction(hashIp(event.getClientAddress()), 'text_scan', 40))) {
			return json({ error: 'Too many checks from this network. Try again in an hour.' }, { status: 429 });
		}
	} catch {
		// If the rate-limit table is unavailable, still allow the stateless check.
	}
	const result = await scanText({ message, sender });
	return json({ result }, { headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
};
