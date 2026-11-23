import { fail, type RequestEvent } from '@sveltejs/kit';
import { isCategory } from './categories';
import {
	getNumberSummary,
	incrementSiteEvent,
	insertBusinessCheck,
	insertEmailSignup,
	insertNumberAlert,
	insertReport,
	insertWaitlist
} from './db';
import { e164ToSlug, normalizeToE164, slugToE164 } from './phone';
import {
	hashIp,
	isHoneypotFilled,
	normalizeEmail,
	sanitizeComment,
	sanitizeName
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
		await incrementSiteEvent('report_submit', event.url.pathname);
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
		await incrementSiteEvent(type === 'business' ? 'waitlist_business' : 'waitlist_app', event.url.pathname);
		return { success: true as const, already: result.already };
	} catch (err) {
		console.error('insertWaitlist failed', err);
		return fail(500, { error: 'We could not save that email. Please try again.' });
	}
}

export async function handleEmailSignupAction(event: RequestEvent) {
	const data = await event.request.formData();
	if (isHoneypotFilled(data.get('website'))) {
		return { success: true as const, already: false };
	}

	const kind = String(data.get('kind') ?? '');
	const allowed = new Set(['quiz', 'checklist', 'article', 'exit']);
	if (!allowed.has(kind)) {
		return fail(400, { error: 'Choose a signup type.' });
	}

	const email = normalizeEmail(String(data.get('email') ?? ''));
	if (!email) {
		return fail(400, { error: 'Enter a valid email address.' });
	}

	const alsoApp = String(data.get('also_app') ?? '') === 'yes';
	let quizScore: number | null = null;
	let quizAnswers: Record<string, string> | null = null;
	if (kind === 'quiz') {
		const { parseQuizAnswers, scoreQuiz } = await import('./quiz');
		const parsed = parseQuizAnswers(data);
		if (parsed) {
			quizAnswers = parsed;
			quizScore = scoreQuiz(parsed);
		}
	}

	try {
		const result = await insertEmailSignup({
			email,
			kind,
			sourcePath: String(data.get('source_path') ?? event.url.pathname).slice(0, 200),
			quizScore,
			quizAnswers,
			ipHash: hashIp(event.getClientAddress())
		});
		if (!result.ok) return fail(429, { error: result.error });

		if (alsoApp) {
			await insertWaitlist({
				email,
				type: 'app',
				ipHash: hashIp(event.getClientAddress())
			});
		}

		await incrementSiteEvent(kind === 'quiz' ? 'quiz_email' : 'email_signup', event.url.pathname);
		if (alsoApp) await incrementSiteEvent('waitlist_app', event.url.pathname);

		return { success: true as const, already: result.already, kind };
	} catch (err) {
		console.error('insertEmailSignup failed', err);
		return fail(500, { error: 'We could not save that email. Please try again.' });
	}
}

export async function handleNumberAlertAction(event: RequestEvent) {
	const data = await event.request.formData();
	if (isHoneypotFilled(data.get('website'))) {
		return { success: true as const, already: false, alert: true as const };
	}

	const rawNumber = String(data.get('number') ?? '');
	const e164 = normalizeToE164(rawNumber) ?? slugToE164(rawNumber);
	if (!e164) {
		return fail(400, { error: 'Enter a valid phone number, including area code.', alert: true });
	}

	const email = normalizeEmail(String(data.get('email') ?? ''));
	if (!email) {
		return fail(400, { error: 'Enter a valid email address.', alert: true });
	}

	try {
		const result = await insertNumberAlert({
			email,
			e164,
			ipHash: hashIp(event.getClientAddress())
		});
		if (!result.ok) return fail(429, { error: result.error, alert: true });
		await incrementSiteEvent('number_alert', event.url.pathname);
		return { success: true as const, already: result.already, alert: true as const };
	} catch (err) {
		console.error('insertNumberAlert failed', err);
		return fail(500, { error: 'We could not save that alert request. Please try again.', alert: true });
	}
}

export async function handleBusinessCheckAction(event: RequestEvent) {
	const data = await event.request.formData();
	if (isHoneypotFilled(data.get('website'))) {
		return { success: true as const, check: true as const };
	}

	const email = normalizeEmail(String(data.get('email') ?? ''));
	if (!email) {
		return fail(400, { error: 'Enter a valid email address.', check: true });
	}

	const named = sanitizeName(String(data.get('business_name') ?? ''));
	if (!named.ok) return fail(400, { error: named.error, check: true });

	const rawNumber = String(data.get('number') ?? '');
	const e164 = normalizeToE164(rawNumber) ?? slugToE164(rawNumber);
	if (!e164) {
		return fail(400, { error: 'Enter the business phone number, including area code.', check: true });
	}

	const cleaned = sanitizeComment(String(data.get('notes') ?? ''));
	if (!cleaned.ok) return fail(400, { error: cleaned.error, check: true });

	try {
		const ipHash = hashIp(event.getClientAddress());
		const result = await insertBusinessCheck({
			email,
			businessName: named.name,
			e164,
			notes: cleaned.comment,
			ipHash
		});
		if (!result.ok) return fail(429, { error: result.error, check: true });

		await insertWaitlist({ email, type: 'business', ipHash });
		const summary = await getNumberSummary(e164);
		await incrementSiteEvent('business_check', event.url.pathname);

		return {
			success: true as const,
			check: true as const,
			e164,
			slug: e164ToSlug(e164),
			reportCount: summary.total
		};
	} catch (err) {
		console.error('insertBusinessCheck failed', err);
		return fail(500, { error: 'We could not save that request. Please try again.', check: true });
	}
}
