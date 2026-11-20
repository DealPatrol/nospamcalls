import { error } from "@sveltejs/kit";
import { getGuide, guidesIn } from "#lib/content/guides";
import type { EntryGenerator, PageLoad } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = () =>
	guidesIn("scams").map((guide) => ({ slug: guide.slug }));

export const load: PageLoad = ({ params }) => {
	const guide = getGuide("scams", params.slug);
	if (!guide) error(404, "Guide not found");
	return { guide };
};
