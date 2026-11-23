import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getNumberSummary } from '#lib/db';
import { handleNumberAlertAction, handleReportAction } from '#lib/forms';
import { e164ToSlug, formatInternational, formatNational, slugToE164 } from '#lib/phone';
import { absoluteUrl } from '#lib/site';

export const load: PageServerLoad = async ({ params, url }) => {
	const e164 = slugToE164(params.e164);
	if (!e164) error(404, 'That does not look like a valid phone number.');

	const canonical = e164ToSlug(e164);
	if (params.e164 !== canonical) {
		redirect(301, `/number/${canonical}${url.search}`);
	}

	const summary = await getNumberSummary(e164);
	const national = formatNational(e164);
	const international = formatInternational(e164);
	const path = `/number/${canonical}`;

	return {
		e164,
		slug: canonical,
		national,
		international,
		summary,
		reported: url.searchParams.get('reported') === '1',
		canonical: absoluteUrl(path),
		title: `${national} caller reports — NoSpamCalls`,
		description: summary.total
			? `${national} has ${summary.total} community report${summary.total === 1 ? '' : 's'} on NoSpamCalls. See categories and recent comments, or add your own.`
			: `${national} does not have community reports yet. Look up the number and add the first report if the call was unwanted.`
	};
};

export const actions: Actions = {
	default: async (event) => handleReportAction(event),
	alert: async (event) => handleNumberAlertAction(event)
};
