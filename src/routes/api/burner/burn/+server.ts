import { json, type RequestHandler } from '@sveltejs/kit';
import { activeBurnerTransaction, AppStoreVerifyError } from '#lib/server/appstore';
import { twilioConfig, TwilioError } from '#lib/server/twilio';
import { authedBurner, buyNumber, fail, insertBurner, notConfigured, publicBurner, readJsonBody, releaseBurner, validAreaCode } from '#lib/server/burner';

/**
 * POST /api/burner/burn  { installId, replace?: boolean, areaCode?, transaction? }  (Authorization: Bearer <token>)
 * Releases the number (Twilio DELETE), deletes its texts/voicemails/recordings, and optionally provisions a replacement.
 */
export const POST: RequestHandler = async ({ request }) => {
	const cfg = twilioConfig();
	if (!cfg) return notConfigured();
	const body = await readJsonBody(request);
	if (!body) return fail(400, 'bad_request', 'Send JSON.');
	const b = await authedBurner(request, body.installId);
	if (!b) return fail(401, 'unauthorized', 'This device isn’t linked to an active burner number.');

	let tx = null;
	if (body.replace === true) {
		if (body.areaCode && !validAreaCode(body.areaCode)) return fail(400, 'bad_area_code', 'Use a 3-digit US area code.');
		try {
			tx = activeBurnerTransaction(String(body.transaction ?? ''));
		} catch (e) {
			if (e instanceof AppStoreVerifyError) return fail(402, 'no_entitlement', e.message);
			throw e;
		}
	}

	try {
		await releaseBurner(cfg, b);
	} catch (e) {
		console.error('burner release failed', e instanceof TwilioError ? `${e.status} ${e.code ?? ''}` : (e as Error).message);
		return fail(502, 'release_failed', 'We couldn’t release the number. Please try again.');
	}
	if (!tx) return json({ released: true, burner: null }, { headers: { 'Cache-Control': 'no-store' } });

	try {
		const bought = await buyNumber(cfg, (body.areaCode as string | undefined) || b.area_code);
		const { row, token } = await insertBurner({
			installId: b.install_id,
			originalTransactionId: tx.originalTransactionId,
			productId: tx.productId,
			expiresAt: new Date(tx.expiresDate!),
			sid: bought.sid,
			phoneNumber: bought.phoneNumber,
			areaCode: bought.areaCode,
			forwardTo: b.forward_to_number ?? '',
			mode: b.screening_mode
		});
		return json({ released: true, burner: publicBurner(row), token }, { headers: { 'Cache-Control': 'no-store' } });
	} catch (e) {
		console.error('burner replace failed', (e as Error).message);
		return json(
			{ released: true, burner: null, error: 'replace_failed', message: 'Your old number was released, but we couldn’t get a new one. Tap “Get a number” to try again.' },
			{ status: 502, headers: { 'Cache-Control': 'no-store' } }
		);
	}
};
