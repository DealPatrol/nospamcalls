import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { slugToE164, e164ToSlug } from '#lib/phone';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	return {};
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
