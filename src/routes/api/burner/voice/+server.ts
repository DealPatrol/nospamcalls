import type { RequestHandler } from '@sveltejs/kit';
import { monthlyMinuteCap, readTwilioWebhook, twiml, twilioConfig, xmlAttr } from '#lib/server/twilio';
import { addMinutes, burnerByNumber, currentMonth, type BurnerRow } from '#lib/server/burner';

const SAY = 'voice="Polly.Joanna"';

function voicemail(b: BurnerRow, caller: string): string {
	const cb = `/api/burner/voicemail-callback?b=${encodeURIComponent(b.id)}&from=${encodeURIComponent(caller)}`;
	return (
		`<Say ${SAY}>The person you are calling is not available. Please leave a message after the tone.</Say>` +
		`<Record maxLength="120" playBeep="true" trim="trim-silence" action="/api/burner/voice?step=vm-done" method="POST" ` +
		`recordingStatusCallback="${xmlAttr(cb)}" recordingStatusCallbackMethod="POST"/>` +
		`<Hangup/>`
	);
}

/**
 * Twilio Voice webhook for burner numbers.
 *  - forward mode: <Dial> the subscriber's real phone (20s), then voicemail if unanswered
 *  - voicemail mode: straight to voicemail
 *  - fair use: once the monthly minute cap is reached, calls go to voicemail only
 */
export const POST: RequestHandler = async ({ request, url }) => {
	if (!twilioConfig()) return new Response('not_configured', { status: 503 });
	const { params, ok } = await readTwilioWebhook(request, url);
	if (!ok) return new Response('Invalid signature', { status: 403 });

	const step = url.searchParams.get('step');
	if (step === 'vm-done') return twiml('<Hangup/>');

	const b = await burnerByNumber(params.To ?? '');
	if (!b || new Date(b.expires_at) < new Date()) {
		return twiml(`<Say ${SAY}>The number you have called is not in service.</Say><Hangup/>`);
	}
	const caller = params.From ?? 'unknown';

	if (step === 'dial-done') {
		await addMinutes(b.id, Number(params.DialCallDuration ?? 0));
		const status = params.DialCallStatus;
		if (status === 'completed' || status === 'answered') return twiml('<Hangup/>');
		return twiml(voicemail(b, caller));
	}

	const used = b.usage_month === currentMonth() ? b.monthly_minutes_used : 0;
	if (b.screening_mode === 'voicemail' || !b.forward_to_number || used >= monthlyMinuteCap()) return twiml(voicemail(b, caller));

	// Pass the original caller ID through so the subscriber sees who is calling.
	const callerId = /^\+\d{8,15}$/.test(caller) ? ` callerId="${xmlAttr(caller)}"` : '';
	const remainingSeconds = Math.max(60, (monthlyMinuteCap() - used) * 60);
	return twiml(
		`<Dial timeout="20" timeLimit="${Math.min(remainingSeconds, 3600)}" answerOnBridge="true"${callerId} action="/api/burner/voice?step=dial-done" method="POST">` +
			`<Number>${xmlAttr(b.forward_to_number)}</Number></Dial>`
	);
};
