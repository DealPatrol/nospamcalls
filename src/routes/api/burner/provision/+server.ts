import { json, type RequestHandler } from '@sveltejs/kit';
import { activeBurnerTransaction, AppStoreVerifyError, sha256 } from '#lib/server/appstore';
import { twilioConfig, TwilioError, twilioRequest } from '#lib/server/twilio';
import { buyNumber, fail, insertBurner, newToken, notConfigured, publicBurner, readJsonBody, usE164, validAreaCode, validInstallId, type BurnerRow } from '#lib/server/burner';
import { sqlClient } from '#lib/server/db';

/**
 * POST /api/burner/provision
 * Body: { installId, areaCode?, forwardTo, screeningMode?, transaction }  (transaction = StoreKit 2 jwsRepresentation)
 * Returns the new number and a one-time token the app keeps in its Keychain.
 */
export const POST: RequestHandler = async ({ request }) => {
	const cfg = twilioConfig();
	if (!cfg) return notConfigured();
	const body = await readJsonBody(request);
	if (!body) return fail(400, 'bad_request', 'Send JSON.');
	const { installId, areaCode, forwardTo, screeningMode, transaction } = body;
	if (!validInstallId(installId)) return fail(400, 'bad_install_id', 'Missing app install ID.');
	if (areaCode !== undefined && areaCode !== null && areaCode !== '' && !validAreaCode(areaCode)) return fail(400, 'bad_area_code', 'Use a 3-digit US area code.');
	const forward = usE164(forwardTo);
	if (!forward) return fail(400, 'bad_forward_to', 'Enter the US mobile number calls should forward to.');
	const mode = screeningMode === 'voicemail' ? 'voicemail' : 'forward';
	if (typeof transaction !== 'string') return fail(402, 'no_entitlement', 'A Pro + Burner subscription is required.');

	let tx;
	try {
		tx = activeBurnerTransaction(transaction);
	} catch (e) {
		if (e instanceof AppStoreVerifyError) return fail(402, 'no_entitlement', e.message);
		throw e;
	}

	const sql = sqlClient();
	const other = await sql`SELECT 1 FROM burner_numbers WHERE status = 'active' AND install_id = ${installId} AND original_transaction_id <> ${tx.originalTransactionId} LIMIT 1`;
	if (other.length) return fail(409, 'already_active', 'This iPhone already has an active burner number. Burn it first to get a new one.');
	// Same subscription, new install (reinstall or new iPhone): re-link the existing number with a fresh token.
	// Only a device holding this Apple-signed subscription transaction can do this.
	const mine = (await sql`SELECT * FROM burner_numbers WHERE status = 'active' AND original_transaction_id = ${tx.originalTransactionId} LIMIT 1`) as BurnerRow[];
	if (mine.length) {
		const token = newToken();
		const rows = (await sql`UPDATE burner_numbers SET install_id = ${installId}, token_hash = ${sha256(token)},
			expires_at = GREATEST(expires_at, ${new Date(tx.expiresDate!).toISOString()}), updated_at = now()
			WHERE id = ${mine[0].id} RETURNING *`) as BurnerRow[];
		return json({ burner: publicBurner(rows[0]), token, relinked: true }, { headers: { 'Cache-Control': 'no-store' } });
	}

	let bought;
	try {
		bought = await buyNumber(cfg, (areaCode as string | undefined) || null);
	} catch (e) {
		console.error('burner provision: purchase failed', e instanceof TwilioError ? `${e.status} ${e.code ?? ''}` : (e as Error).message);
		return fail(502, 'provision_failed', 'We couldn’t get a number right now. Try another area code or try again later.');
	}
	try {
		const { row, token } = await insertBurner({
			installId,
			originalTransactionId: tx.originalTransactionId,
			productId: tx.productId,
			expiresAt: new Date(tx.expiresDate!),
			sid: bought.sid,
			phoneNumber: bought.phoneNumber,
			areaCode: bought.areaCode,
			forwardTo: forward,
			mode
		});
		return json({ burner: publicBurner(row), token, requestedAreaCode: areaCode || null }, { headers: { 'Cache-Control': 'no-store' } });
	} catch (e) {
		// Never leave a paid-for number orphaned.
		await twilioRequest(cfg, 'DELETE', `/IncomingPhoneNumbers/${encodeURIComponent(bought.sid)}.json`).catch(() => null);
		console.error('burner provision: save failed', (e as Error).message);
		return fail(409, 'already_active', 'This subscription already has an active burner number.');
	}
};
