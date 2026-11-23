import type { Actions } from "./$types";
import { handleBusinessCheckAction } from "#lib/forms";

export const actions: Actions = {
	check: async (event) => handleBusinessCheckAction(event)
};
