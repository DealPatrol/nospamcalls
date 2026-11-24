import { error } from '@sveltejs/kit';
import { unsubscribeByToken, verifyUnsubscribeToken } from '#lib/server/email';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	if (url.searchParams.get('done') === '1') {
		return { state: 'done' as const };
	}
	const token = url.searchParams.get('token') ?? '';
	if (!token || !verifyUnsubscribeToken(token)) {
		error(400, 'This unsubscribe link is invalid or incomplete.');
	}
	return { state: 'confirm' as const, token };
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const form = await request.formData();
		const token = String(form.get('token') ?? url.searchParams.get('token') ?? '');
		const result = await unsubscribeByToken(token);
		if (!result.ok) {
			error(400, 'This unsubscribe link is invalid or incomplete.');
		}
		return { state: 'done' as const };
	}
};
