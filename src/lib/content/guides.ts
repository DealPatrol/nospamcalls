import { BLOCK_GUIDES } from "./block-guides";
import { LEARN_GUIDES } from "./learn-guides";
import { SCAMS_A } from "./scams-a";
import { SCAMS_B } from "./scams-b";
import { SCAMS_C } from "./scams-c";
import { SCAMS_D } from "./scams-d";
import type { Guide } from "./types";

export type { Guide, GuideSection, RelatedLink } from "./types";

export const GUIDES: Guide[] = [
	...SCAMS_A,
	...SCAMS_B,
	...SCAMS_C,
	...SCAMS_D,
	...BLOCK_GUIDES,
	...LEARN_GUIDES
];

export function getGuideByPath(path: string): Guide | undefined {
	return GUIDES.find((guide) => guide.path === path);
}

export function getGuide(section: "scams" | "block", slug: string): Guide | undefined {
	const prefix = section === "scams" ? "/scams/" : "/block-spam-calls/";
	return GUIDES.find((guide) => guide.path === `${prefix}${slug}`);
}

export function guidesIn(section: Guide["section"]): Guide[] {
	return GUIDES.filter((guide) => guide.section === section);
}

export function allGuidePaths(): string[] {
	return GUIDES.map((guide) => guide.path);
}

export const SEO_HUB_PATHS = ["/scams", "/block-spam-calls", "/area-code"] as const;
