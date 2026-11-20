import type { Actions, PageServerLoad } from './$types';
import { handleReportAction } from '#lib/forms';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	return { preset: url.searchParams.get('number') ?? '' };
};

export const actions: Actions = {
	create: async (event) => {
		const result = await handleReportAction(event);
		if (result && 'success' in result && result.success && 'slug' in result && result.slug) {
			redirect(303, `/number/${result.slug}?reported=1`);
		}
		return result;
	}
};
