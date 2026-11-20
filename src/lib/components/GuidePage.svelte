<script lang="ts">
	import type { Guide } from "#lib/content/guides";
	import {
		articleJsonLd,
		breadcrumbJsonLd,
		faqJsonLd,
		howToJsonLd,
		type Crumb
	} from "#lib/seo";
	import Breadcrumbs from "./Breadcrumbs.svelte";
	import Disclaimer from "./Disclaimer.svelte";
	import SeoHead from "./SeoHead.svelte";

	let { guide, origin }: { guide: Guide; origin: string } = $props();

	const crumbs: Crumb[] = $derived([{ href: "/", label: "Home" }, ...guide.crumbs]);
	const canonical = $derived(`${origin}${guide.path}`);
	const jsonLd = $derived(
		[
			breadcrumbJsonLd(origin, crumbs),
			guide.schema === "HowTo" && guide.howToSteps
				? howToJsonLd({
						name: guide.howToName ?? guide.headline,
						description: guide.description,
						steps: guide.howToSteps
					})
				: articleJsonLd({
						origin,
						path: guide.path,
						headline: guide.headline,
						description: guide.description
					}),
			faqJsonLd(guide.faqs)
		].filter(Boolean)
	);
</script>

<SeoHead title={guide.title} description={guide.description} {canonical} jsonLd={jsonLd} />

<Breadcrumbs {crumbs} />

<article class="prose guide">
	<h1>{guide.headline}</h1>
	<div class="answer-box">
		<p class="answer-label">In short</p>
		<p>{guide.answer}</p>
	</div>
	<Disclaimer />

	{#each guide.sections as section}
		<h2>{section.heading}</h2>
		{@html section.html}
	{/each}

	{#if guide.faqs.length}
		<h2>Frequently asked questions</h2>
		{#each guide.faqs as faq}
			<h3>{faq.q}</h3>
			<p>{faq.a}</p>
		{/each}
	{/if}

	{#if guide.sources.length}
		<h2>Official sources</h2>
		<ul class="source-list">
			{#each guide.sources as source}
				<li>
					<a href={source.href} rel="noopener noreferrer">{source.label}</a>
				</li>
			{/each}
		</ul>
	{/if}

	{#if guide.related.length}
		<h2>Related guides</h2>
		<ul>
			{#each guide.related as item}
				<li><a href={item.href}>{item.label}</a></li>
			{/each}
		</ul>
	{/if}
</article>
