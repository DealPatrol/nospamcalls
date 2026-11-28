import { error } from '@sveltejs/kit';
import { stateAreaCodes, stateBySlug } from '#lib/content/state-spam';
import { govStateSummary, type StateSummary } from '#lib/server/gov';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const state = stateBySlug(params.state);
	if (!state) error(404, 'State not found');
	const codes = stateAreaCodes(state.abbr);
	let summary: StateSummary = { numbers: 0, complaints: 0, top: [], subjects: [], areaCodes: [] };
	try {
		summary = await govStateSummary(
			state.abbr,
			codes.map((c) => c.npa)
		);
	} catch (err) {
		console.error('state summary query failed', err);
	}
	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=3600' });
	return { state, codes, summary };
};
