import { json, type RequestHandler } from '@sveltejs/kit';
import { activeBurnerTransaction } from '#lib/server/appstore';
import { twilioConfig } from '#lib/server/twilio';
import { authedBurner, notConfigured, publicBurner } from '#lib/server/burner';
import { sqlClient } from '#lib/server/db';

/**
 * GET /api/burner/status?installId=...   (Authorization: Bearer <token>)
 * Optional header X-NSC-Transaction: latest StoreKit 2 jwsRepresentation, used to extend the number after a renewal.
 */
export const GET: RequestHandler = async ({ request, url }) => {
	if (!twilioConfig()) return notConfigured();
	const b = await authedBurner(request, url.searchParams.get('installId'));
	if (!b) return json({ burner: null, voicemails: [], messages: [] }, { headers: { 'Cache-Control': 'no-store' } });
	const sql = sqlClient();
	const jws = request.headers.get('x-nsc-transaction');
	if (jws) {
		try {
			const tx = activeBurnerTransaction(jws);
			if (tx.originalTransactionId === b.original_transaction_id && tx.expiresDate && new Date(tx.expiresDate) > new Date(b.expires_at)) {
				await sql`UPDATE burner_numbers SET expires_at = ${new Date(tx.expiresDate).toISOString()}, subscription_product_id = ${tx.productId}, updated_at = now() WHERE id = ${b.id}`;
				b.expires_at = new Date(tx.expiresDate).toISOString();
			}
		} catch {
			/* stale or non-burner transaction: keep current expiry */
		}
	}
	const [voicemails, messages] = await Promise.all([
		sql`SELECT id, caller, duration_seconds, created_at FROM burner_voicemails WHERE burner_id = ${b.id} ORDER BY created_at DESC LIMIT 25`,
		sql`SELECT id, from_number, body, num_media, received_at FROM burner_messages WHERE burner_id = ${b.id} ORDER BY received_at DESC LIMIT 50`
	]);
	return json(
		{
			burner: publicBurner(b),
			voicemails: (voicemails as { id: string; caller: string | null; duration_seconds: number; created_at: string }[]).map((v) => ({
				id: v.id,
				caller: v.caller,
				durationSeconds: v.duration_seconds,
				createdAt: v.created_at,
				audioPath: `/api/burner/voicemail/${v.id}`
			})),
			messages: (messages as { id: string; from_number: string; body: string; num_media: number; received_at: string }[]).map((m) => ({
				id: m.id,
				from: m.from_number,
				body: m.body,
				hasMedia: m.num_media > 0,
				receivedAt: m.received_at
			}))
		},
		{ headers: { 'Cache-Control': 'no-store' } }
	);
};
