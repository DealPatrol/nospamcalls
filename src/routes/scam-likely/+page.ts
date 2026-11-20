import { error } from "@sveltejs/kit";
import { getGuideByPath } from "#lib/content/guides";
import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = () => {
	const guide = getGuideByPath("/scam-likely");
	if (!guide) error(404, "Guide not found");
	return { guide };
};
