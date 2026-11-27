import { json, type RequestHandler } from '@sveltejs/kit';
import { twilioConfig } from '#lib/server/twilio';
import { authedBurner, fail, notConfigured, publicBurner, readJsonBody, usE164 } from '#lib/server/burner';
import { sqlClient } from '#lib/server/db';

/** POST /api/burner/settings  { installId, forwardTo?, screeningMode? }  (Authorization: Bearer <token>) */
export const POST: RequestHandler = async ({ request }) => {
	if (!twilioConfig()) return notConfigured();
	const body = await readJsonBody(request);
	if (!body) return fail(400, 'bad_request', 'Send JSON.');
	const b = await authedBurner(request, body.installId);
	if (!b) return fail(401, 'unauthorized', 'This device isn’t linked to an active burner number.');
	let forward = b.forward_to_number;
	if (body.forwardTo !== undefined) {
		forward = usE164(body.forwardTo);
		if (!forward) return fail(400, 'bad_forward_to', 'Enter a valid US number.');
	}
	let mode = b.screening_mode;
	if (body.screeningMode !== undefined) {
		if (body.screeningMode !== 'forward' && body.screeningMode !== 'voicemail') return fail(400, 'bad_mode', 'Choose forward or voicemail.');
		mode = body.screeningMode;
	}
	const sql = sqlClient();
	await sql`UPDATE burner_numbers SET forward_to_number = ${forward}, screening_mode = ${mode}, updated_at = now() WHERE id = ${b.id}`;
	return json({ burner: publicBurner({ ...b, forward_to_number: forward, screening_mode: mode }) }, { headers: { 'Cache-Control': 'no-store' } });
};
