import type { PageServerLoad } from './$types';
import { BROKERS, BROKERS_CHECKED, REGISTRIES } from '#lib/content/brokers';

export const load: PageServerLoad = async () => ({ brokers: BROKERS, registries: REGISTRIES, checked: BROKERS_CHECKED });
