import type { RequestHandler } from '@sveltejs/kit';
import { readTwilioWebhook, twilioConfig } from '#lib/server/twilio';
import { addMinutes } from '#lib/server/burner';
import { sqlClient } from '#lib/server/db';

/** Twilio recordingStatusCallback: stores a finished voicemail for the burner's inbox. */
export const POST: RequestHandler = async ({ request, url }) => {
	if (!twilioConfig()) return new Response('not_configured', { status: 503 });
	const { params, ok } = await readTwilioWebhook(request, url);
	if (!ok) return new Response('Invalid signature', { status: 403 });
	if (params.RecordingStatus && params.RecordingStatus !== 'completed') return new Response(null, { status: 204 });
	const burnerId = url.searchParams.get('b') ?? '';
	if (!/^[0-9a-f-]{36}$/i.test(burnerId) || !params.RecordingSid) return new Response(null, { status: 204 });
	const sql = sqlClient();
	const live = await sql`SELECT id FROM burner_numbers WHERE id = ${burnerId} AND status = 'active'`;
	if (!live.length) return new Response(null, { status: 204 });
	const duration = Number(params.RecordingDuration ?? 0) || 0;
	await sql`INSERT INTO burner_voicemails (burner_id, recording_sid, recording_url, caller, duration_seconds)
		VALUES (${burnerId}, ${params.RecordingSid}, ${params.RecordingUrl ?? null}, ${(url.searchParams.get('from') ?? '').slice(0, 32) || null}, ${duration})
		ON CONFLICT (recording_sid) DO NOTHING`;
	await addMinutes(burnerId, duration);
	return new Response(null, { status: 204 });
};
