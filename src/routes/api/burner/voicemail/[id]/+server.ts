import type { RequestHandler } from '@sveltejs/kit';
import { twilioConfig, twilioMediaFetch } from '#lib/server/twilio';
import { authedBurner, fail, notConfigured } from '#lib/server/burner';
import { sqlClient } from '#lib/server/db';

/** GET /api/burner/voicemail/:id?installId=...  (Bearer token) — streams the MP3 from Twilio to the app. */
export const GET: RequestHandler = async ({ request, url, params }) => {
	const cfg = twilioConfig();
	if (!cfg) return notConfigured();
	const b = await authedBurner(request, url.searchParams.get('installId'));
	if (!b) return fail(401, 'unauthorized', 'Not linked to this burner number.');
	if (!/^[0-9a-f-]{36}$/i.test(params.id ?? '')) return fail(404, 'not_found', 'Voicemail not found.');
	const sql = sqlClient();
	const rows = (await sql`SELECT recording_url FROM burner_voicemails WHERE id = ${params.id} AND burner_id = ${b.id}`) as { recording_url: string | null }[];
	if (!rows[0]?.recording_url) return fail(404, 'not_found', 'Voicemail not found.');
	const res = await twilioMediaFetch(cfg, `${rows[0].recording_url}.mp3`);
	if (!res.ok || !res.body) return fail(502, 'unavailable', 'Recording is not available yet.');
	return new Response(res.body, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, no-store' } });
};
