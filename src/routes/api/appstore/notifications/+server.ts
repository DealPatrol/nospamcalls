import { json, type RequestHandler } from '@sveltejs/kit';
import { AppStoreVerifyError, BUNDLE_ID, BURNER_PRODUCTS, verifyAppleJws, type AppleTransaction } from '#lib/server/appstore';
import { sqlClient } from '#lib/server/db';

type Notification = { notificationType: string; subtype?: string; data?: { bundleId?: string; signedTransactionInfo?: string } };

/**
 * App Store Server Notifications V2 endpoint (set this URL in App Store Connect → App Information).
 * Keeps each burner number's paid-through date in sync with renewals, expirations, refunds and revocations,
 * so numbers stay active while the subscription renews even if the app isn't opened.
 */
export const POST: RequestHandler = async ({ request }) => {
	let signedPayload: unknown;
	try {
		({ signedPayload } = await request.json());
	} catch {
		return json({ error: 'bad_request' }, { status: 400 });
	}
	if (typeof signedPayload !== 'string') return json({ error: 'bad_request' }, { status: 400 });
	let n: Notification;
	let tx: AppleTransaction | null = null;
	try {
		n = verifyAppleJws<Notification>(signedPayload);
		if (n.data?.bundleId && n.data.bundleId !== BUNDLE_ID) return json({ ok: true, ignored: 'other_app' });
		if (n.data?.signedTransactionInfo) tx = verifyAppleJws<AppleTransaction>(n.data.signedTransactionInfo);
	} catch (e) {
		if (e instanceof AppStoreVerifyError) return json({ error: 'invalid_signature' }, { status: 401 });
		throw e;
	}
	if (!tx?.originalTransactionId) return json({ ok: true });
	const sql = sqlClient();
	const ended = ['EXPIRED', 'REFUND', 'REVOKE', 'GRACE_PERIOD_EXPIRED'].includes(n.notificationType) || !!tx.revocationDate;
	if (ended) {
		// Number is released by the daily cleanup job after a short grace window.
		await sql`UPDATE burner_numbers SET expires_at = LEAST(expires_at, now()), updated_at = now() WHERE original_transaction_id = ${tx.originalTransactionId} AND status = 'active'`;
	} else if (tx.expiresDate) {
		// Downgrading to plain Pro (no burner) takes effect at the end of the paid period.
		const keep = BURNER_PRODUCTS.has(tx.productId);
		if (keep) {
			await sql`UPDATE burner_numbers SET expires_at = GREATEST(expires_at, ${new Date(tx.expiresDate).toISOString()}), subscription_product_id = ${tx.productId}, updated_at = now()
				WHERE original_transaction_id = ${tx.originalTransactionId} AND status = 'active'`;
		}
	}
	return json({ ok: true });
};
