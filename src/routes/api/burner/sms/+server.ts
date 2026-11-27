import type { RequestHandler } from '@sveltejs/kit';
import { readTwilioWebhook, twiml, twilioConfig } from '#lib/server/twilio';
import { burnerByNumber } from '#lib/server/burner';
import { sqlClient } from '#lib/server/db';

const KEEP = 200;

/** Twilio Messaging webhook: stores inbound texts for the burner inbox. Never auto-replies. */
export const POST: RequestHandler = async ({ request, url }) => {
	if (!twilioConfig()) return new Response('not_configured', { status: 503 });
	const { params, ok } = await readTwilioWebhook(request, url);
	if (!ok) return new Response('Invalid signature', { status: 403 });
	const b = await burnerByNumber(params.To ?? '');
	if (b && new Date(b.expires_at) > new Date()) {
		const sql = sqlClient();
		await sql`INSERT INTO burner_messages (burner_id, twilio_sid, from_number, body, num_media)
			VALUES (${b.id}, ${params.MessageSid ?? null}, ${(params.From ?? 'unknown').slice(0, 32)}, ${(params.Body ?? '').slice(0, 1600)}, ${Number(params.NumMedia ?? 0) || 0})
			ON CONFLICT (twilio_sid) DO NOTHING`;
		await sql`DELETE FROM burner_messages WHERE burner_id = ${b.id} AND id NOT IN (
			SELECT id FROM burner_messages WHERE burner_id = ${b.id} ORDER BY received_at DESC LIMIT ${KEEP})`;
	}
	return twiml('');
};
