import type { PageServerLoad } from './$types';
import { openSettlements, SETTLEMENTS_CHECKED } from '#lib/content/settlements';

export const load: PageServerLoad = async ({ url }) => {
	return {
		settlements: openSettlements(),
		checked: SETTLEMENTS_CHECKED,
		prefill: url.searchParams.get('number') ?? ''
	};
};
