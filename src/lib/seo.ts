import { SITE_NAME, absoluteUrl } from '#lib/site';

export const CONTENT_UPDATED = '2026-11-20';

export type Crumb = { href: string; label: string };

/** Search results show about 155-160 characters of a meta description. */
export const META_DESCRIPTION_MAX = 160;
/** Trims a meta description to a sentence end, or else a word boundary with an ellipsis, so results never cut mid-word. */
export function metaDescription(text: string, max = META_DESCRIPTION_MAX): string {
	const clean = text.replace(/\s+/g, ' ').trim();
	if (clean.length <= max) return clean;
	const window = clean.slice(0, max);
	const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '));
	if (sentenceEnd >= 90) return window.slice(0, sentenceEnd + 1);
	const space = clean.slice(0, max - 1).lastIndexOf(' ');
	return `${clean.slice(0, space > 0 ? space : max - 1).replace(/[\s,;:—–-]+$/, '')}…`;
}


export function breadcrumbJsonLd(origin: string, crumbs: Crumb[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: crumbs.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.label,
			item: crumb.href.startsWith('http') ? crumb.href : `${origin}${crumb.href}`
		}))
	};
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
	if (!faqs.length) return null;
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.q,
			acceptedAnswer: { '@type': 'Answer', text: faq.a }
		}))
	};
}

export function articleJsonLd(opts: {
	origin: string;
	path: string;
	headline: string;
	description: string;
	dateModified?: string;
}) {
	const url = `${opts.origin}${opts.path}`;
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: opts.headline,
		description: opts.description,
		dateModified: opts.dateModified ?? CONTENT_UPDATED,
		author: { '@type': 'Organization', name: SITE_NAME, url: opts.origin },
		publisher: { '@type': 'Organization', name: SITE_NAME, url: opts.origin },
		mainEntityOfPage: { '@type': 'WebPage', '@id': url }
	};
}

export function howToJsonLd(opts: {
	name: string;
	description: string;
	steps: { name: string; text: string }[];
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'HowTo',
		name: opts.name,
		description: opts.description,
		step: opts.steps.map((step) => ({
			'@type': 'HowToStep',
			name: step.name,
			text: step.text
		}))
	};
}

export { absoluteUrl, SITE_NAME };

export function webAppJsonLd(opts: { origin: string; path: string; name: string; description: string; category?: string }) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: opts.name,
		description: opts.description,
		url: `${opts.origin}${opts.path}`,
		applicationCategory: opts.category ?? 'SecurityApplication',
		operatingSystem: 'Any (web browser)',
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		publisher: { '@type': 'Organization', name: SITE_NAME, url: opts.origin }
	};
}

export function websiteJsonLd(origin: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: `${origin}/`,
		potentialAction: {
			'@type': 'SearchAction',
			target: { '@type': 'EntryPoint', urlTemplate: `${origin}/number/{phone}` },
			'query-input': 'required name=phone'
		}
	};
}

export function organizationJsonLd(origin: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		url: `${origin}/`,
		description:
			'Free spam-call lookup backed by FTC and FCC complaint data, a personal blocklist, TCPA self-help tools, data-broker opt-outs, and email spam tools.'
	};
}
