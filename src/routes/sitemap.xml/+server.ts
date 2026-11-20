import { allGuidePaths, SEO_HUB_PATHS } from "#lib/content/guides";
import { AREA_CODES } from "#lib/data/area-codes";
import { recentReportedSlugs } from "#lib/db";
import { e164ToSlug } from "#lib/phone";
import { absoluteUrl } from "#lib/site";
import type { RequestHandler } from "./$types";

const STATIC_PATHS = [
	"/",
	"/report",
	"/stop-spam-calls",
	"/business",
	"/app",
	"/privacy",
	"/terms",
	...SEO_HUB_PATHS,
	...allGuidePaths()
];

export const prerender = false;

export const GET: RequestHandler = async () => {
	let numbers: string[] = [];
	try {
		numbers = await recentReportedSlugs(1000);
	} catch (err) {
		console.error("sitemap number query failed", err);
	}

	const urls = [
		...STATIC_PATHS.map((path) => ({ loc: absoluteUrl(path), changefreq: "weekly" })),
		...AREA_CODES.map((code) => ({
			loc: absoluteUrl(`/area-code/${code.npa}`),
			changefreq: "weekly"
		})),
		...numbers.map((e164) => ({
			loc: absoluteUrl(`/number/${e164ToSlug(e164)}`),
			changefreq: "daily"
		}))
	];

	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		urls
			.map(
				(u) =>
					`  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n  </url>`
			)
			.join("\n") +
		"\n</urlset>\n";

	return new Response(body, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "max-age=0, s-maxage=3600"
		}
	});
};

function escapeXml(value: string): string {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
