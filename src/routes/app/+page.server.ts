import type { Actions } from './$types';
import { handleWaitlistAction } from '#lib/forms';

export const actions: Actions = {
	default: async (event) => handleWaitlistAction(event)
};
