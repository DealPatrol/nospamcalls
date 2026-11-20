import type { Crumb } from "#lib/seo";

export type GuideSection = { heading: string; html: string };
export type RelatedLink = { href: string; label: string };

export type Guide = {
	slug: string;
	path: string;
	section: "scams" | "block" | "learn";
	title: string;
	description: string;
	headline: string;
	answer: string;
	schema: "Article" | "HowTo";
	howToName?: string;
	howToSteps?: { name: string; text: string }[];
	faqs: { q: string; a: string }[];
	sections: GuideSection[];
	related: RelatedLink[];
	sources: RelatedLink[];
	crumbs: Crumb[];
};
