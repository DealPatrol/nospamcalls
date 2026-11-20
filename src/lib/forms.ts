import { fail, type RequestEvent } from '@sveltejs/kit';
import { isCategory } from './categories';
import { insertReport, insertWaitlist } from './db';
import { e164ToSlug, normalizeToE164, slugToE164 } from './phone';
import {
	hashIp,
	isHoneypotFilled,
	normalizeEmail,
	sanitizeComment
} from './security';

export async function handleReportAction(event: RequestEvent) {
	const data = await event.request.formData();
	if (isHoneypotFilled(data.get('website'))) {
		return { success: true as const };
	}

	const rawNumber = String(data.get('number') ?? '');
	const e164 = normalizeToE164(rawNumber) ?? slugToE164(rawNumber);
	if (!e164) {
		return fail(400, { error: 'Enter a valid phone number, including area code.' });
	}

	const category = String(data.get('category') ?? '');
	if (!isCategory(category)) {
		return fail(400, { error: 'Choose a category for this call.' });
	}

	const cleaned = sanitizeComment(String(data.get('comment') ?? ''));
	if (!cleaned.ok) {
		return fail(400, { error: cleaned.error });
	}

	try {
		const result = await insertReport({
			e164,
			category,
			comment: cleaned.comment,
			ipHash: hashIp(event.getClientAddress())
		});
		if (!result.ok) return fail(429, { error: result.error });
		return { success: true as const, slug: e164ToSlug(e164) };
	} catch (err) {
		console.error('insertReport failed', err);
		return fail(500, { error: 'We could not save that report. Please try again.' });
	}
}

export async function handleWaitlistAction(event: RequestEvent) {
	const data = await event.request.formData();
	if (isHoneypotFilled(data.get('website'))) {
		return { success: true as const };
	}

	const type = String(data.get('type') ?? '');
	if (type !== 'app' && type !== 'business') {
		return fail(400, { error: 'Choose a waitlist.' });
	}

	const email = normalizeEmail(String(data.get('email') ?? ''));
	if (!email) {
		return fail(400, { error: 'Enter a valid email address.' });
	}

	try {
		const result = await insertWaitlist({
			email,
			type,
			ipHash: hashIp(event.getClientAddress())
		});
		if (!result.ok) return fail(429, { error: result.error });
		return { success: true as const, already: result.already };
	} catch (err) {
		console.error('insertWaitlist failed', err);
		return fail(500, { error: 'We could not save that email. Please try again.' });
	}
}
