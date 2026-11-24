import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { slugToE164, e164ToSlug } from '#lib/phone';
import { govStats, topGovNumbers, type GovNumber } from '#lib/server/gov';

export const load: PageServerLoad = async () => {
	let active: GovNumber[] = [];
	let gov = { numbers: 0, complaints: 0, lastIngest: null as string | null };
	if (process.env.DATABASE_URL) {
		try {
			[active, gov] = await Promise.all([topGovNumbers(8, 7, 2), govStats()]);
		} catch (err) {
			console.error('home gov data failed', err);
		}
	}
	return { active, gov };
};

export const actions: Actions = {
	search: async ({ request }) => {
		const data = await request.formData();
		const number = String(data.get('phone') ?? '');
		const e164 = slugToE164(number) ?? slugToE164(number.replace(/[^0-9+]/g, ''));
		if (!e164) {
			return fail(400, { error: 'Enter a valid U.S. or international phone number.' });
		}
		redirect(303, `/number/${e164ToSlug(e164)}`);
	}
};
