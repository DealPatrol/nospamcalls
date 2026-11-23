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
	import TopicCta from "./TopicCta.svelte";

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
	{#if guide.section === "scams"}
		<TopicCta
			variant="report"
			heading="Did a number like this call you?"
			body="Add it to the public log, then get a free two-minute plan to tighten your phone and carrier settings."
			href="/report"
			label="Report a number"
		/>
	{:else if guide.section === "block"}
		<TopicCta
			variant="protect"
			heading="Get a personalized blocking plan"
			body="Answer six questions and print a checklist for iPhone, Android, your carrier, and the Do Not Call list. No account required."
			href="/protect"
			label="Take the free checkup"
		/>
	{:else if guide.path === "/scam-likely"}
		<TopicCta
			variant="business"
			heading="Is a real business number being flagged?"
			body="Request a free look at our community log and official next steps. We cannot promise to clear a label."
			href="/business"
			label="Request a free Scam Likely check"
		/>
	{:else if guide.path === "/report-spam-calls"}
		<TopicCta
			variant="report"
			heading="Also log the number here"
			body="Official FTC and FCC reports come first. A NoSpamCalls report helps the next person who looks the number up."
			href="/report"
			label="Report a number"
		/>
	{/if}

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

	<div class="no-print">
		<TopicCta
			variant="protect"
			heading="Free next step: a two-minute protection plan"
			body="See which official, free settings you still have turned off. Email is optional. If you want an app later, the waitlist includes a founding-member pricing promise and no payment now."
			href="/protect"
			label="Get my plan"
		/>
		<p class="fine-print"><a href="/app">Join the app waitlist</a> if you want a note when a consumer app is ready.</p>
	</div>
</article>
