import type { PageServerLoad } from './$types';
import { govStats, topGovNumbers, type GovNumber } from '#lib/server/gov';

export const load: PageServerLoad = async ({ url }) => {
	let top: GovNumber[] = [];
	let gov = { numbers: 0, complaints: 0, lastIngest: null as string | null };
	try {
		[top, gov] = await Promise.all([topGovNumbers(25, 30, 2), govStats()]);
	} catch (err) {
		console.error('blocklist gov data failed', err);
	}
	return { top, gov, prefill: url.searchParams.get('number') ?? '' };
};
