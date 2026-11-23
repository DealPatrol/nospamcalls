import { handleEmailSignupAction } from "#lib/forms";
import type { Actions } from "./$types";

export const prerender = false;

export const actions: Actions = {
	email: async (event) => handleEmailSignupAction(event)
};
