import { dataIndex, type DataIndex } from '#lib/server/gov';
import { getAreaCode } from '#lib/data/area-codes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=3600' });
	let index: DataIndex | null = null;
	try {
		index = await dataIndex();
	} catch (err) {
		console.error('data index failed', err);
	}
	const areaPages = Object.fromEntries((index?.areaCodes ?? []).map((a) => [a.npa, Boolean(getAreaCode(a.npa))]));
	return { index, areaPages };
};
