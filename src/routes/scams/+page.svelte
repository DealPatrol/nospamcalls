<script lang="ts">
	import { guidesIn } from "#lib/content/guides";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import { articleJsonLd, breadcrumbJsonLd, type Crumb } from "#lib/seo";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const guides = guidesIn("scams");
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/scams", label: "Scam call guides" }
	];
	const title = "Phone and text scam guides";
	const description =
		"Plain-English guides to common U.S. phone and text scams — IRS, Social Security, Medicare, car warranty, bank alerts, toll texts, one-ring calls, and more — with official FTC, FCC, and agency links.";
	const canonical = $derived(`${data.origin}/scams`);
	const jsonLd = $derived([
		breadcrumbJsonLd(data.origin, crumbs),
		articleJsonLd({
			origin: data.origin,
			path: "/scams",
			headline: title,
			description
		})
	]);
</script>

<SeoHead {title} {description} {canonical} {jsonLd} />
<Breadcrumbs {crumbs} />

<article class="prose">
	<h1>Phone and text scam guides</h1>
	<div class="answer-box">
		<p class="answer-label">In short</p>
		<p>
			Most phone and text scams try to rush you into paying or sharing information. Hang up or ignore the
			message, contact the real company or agency only through a number or site you look up yourself, and
			report the incident to the FTC and, for robocalls, the FCC.
		</p>
	</div>
	<p>
		These guides explain how common U.S. phone and text scams work, what official agencies say, and where
		to report them. They are general consumer information, not legal advice.
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
		Also see <a href="/block-spam-calls">how to block spam calls</a>,
		<a href="/report-spam-calls">how to report spam calls</a>,
		<a href="/scam-likely">what “Scam Likely” means</a>, and
		<a href="/tcpa-rights">your rights under the TCPA</a>.
	</p>
</article>
