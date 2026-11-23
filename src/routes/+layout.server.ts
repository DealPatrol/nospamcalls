import { getPublicStats, type PublicStats } from '#lib/db';
import { siteUrl } from '#lib/site';
import type { LayoutServerLoad } from './$types';

const emptyStats: PublicStats = { reports: 0, appWaitlist: 0, businessWaitlist: 0 };

export const load: LayoutServerLoad = async () => {
	let stats = emptyStats;
	if (process.env.DATABASE_URL) {
		try {
			stats = await getPublicStats();
		} catch (err) {
			console.error('public stats failed', err);
		}
	}
	return { origin: siteUrl(), stats };
};
