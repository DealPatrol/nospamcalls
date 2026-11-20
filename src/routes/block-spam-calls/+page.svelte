<script lang="ts">
	import { guidesIn } from "#lib/content/guides";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import { articleJsonLd, breadcrumbJsonLd, type Crumb } from "#lib/seo";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const guides = guidesIn("block");
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/block-spam-calls", label: "Block spam calls" }
	];
	const title = "How to block spam calls on iPhone, Android, and your carrier";
	const description =
		"Free, official ways to block or silence spam calls on iPhone, Android, AT&T, Verizon, and T-Mobile, plus the National Do Not Call Registry. No app purchase required.";
	const canonical = $derived(`${data.origin}/block-spam-calls`);
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		articleJsonLd({ origin: data.origin, path: "/block-spam-calls", headline: title, description })
	]}
/>
<Breadcrumbs {crumbs} />

<article class="prose">
	<h1>How to block spam calls</h1>
	<div class="answer-box">
		<p class="answer-label">In short</p>
		<p>
			Turn on your phone’s unknown-caller or spam-filter settings, enable your carrier’s free scam tools,
			and register at DoNotCall.gov. These steps reduce a lot of unwanted calls, but they cannot stop every
			spoofed number.
		</p>
	</div>
	<p>
		Start with the guide that matches your phone or carrier. Then add the <a href="/stop-spam-calls">Do Not Call and opt-out steps</a>
		and <a href="/report-spam-calls">official reporting</a> if you have not already.
	</p>
	<ul class="guide-index">
		{#each guides as guide}
			<li>
				<a href={guide.path}><strong>{guide.headline}</strong></a>
				<p>{guide.description}</p>
			</li>
		{/each}
	</ul>
	<p>
		If a call is labeled “Scam Likely,” read <a href="/scam-likely">what that label means</a>. If a
		legitimate business is getting flagged, see the <a href="/business">business waitlist</a>.
	</p>
</article>
