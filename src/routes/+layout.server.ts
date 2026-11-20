import { siteUrl } from '#lib/site';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return { origin: siteUrl() };
};
