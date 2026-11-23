import type { Actions } from "./$types";
import { handleBusinessCheckAction, handleWaitlistAction } from "#lib/forms";

export const actions: Actions = {
	default: async (event) => handleWaitlistAction(event),
	check: async (event) => handleBusinessCheckAction(event)
};
