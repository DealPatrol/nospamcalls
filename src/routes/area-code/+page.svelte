<script lang="ts">
	import { areaCodesByState, AREA_CODE_SOURCE, TOLL_FREE_CODES } from "#lib/data/area-codes";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, type Crumb } from "#lib/seo";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const groups = areaCodesByState();
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/area-code", label: "Area codes" }
	];
	const title = "U.S. area code lookup: state, time zone, and reported calls";
	const description =
		"Look up every in-service U.S. geographic area code and major toll-free codes. See the official NANPA state or territory, time zone, overlay notes, and recent community reports. Caller ID can be spoofed.";
	const canonical = $derived(`${data.origin}/area-code`);
	const faqs = [
		{
			q: "Does an area code on caller ID prove the caller is in that state?",
			a: "No. Scammers routinely spoof local area codes so a call looks like it is coming from nearby. Use the area-code page for official numbering facts and community reports, not as proof of the caller’s location."
		},
		{
			q: "Where do these area-code facts come from?",
			a: "The state or territory, time zone, in-service date, and overlay information come from the official NANPA NPA database. We do not invent city lists or local scam statistics."
		},
		{
			q: "Are 800 numbers assigned to one state?",
			a: "No. In-service toll-free codes such as 800 and 888 are nationwide numbers in the North American Numbering Plan, not a single state’s area code."
		}
	];

	let query = $state("");
	const match = $derived(query.replace(/\D/g, "").slice(0, 3));
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	type="website"
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		articleJsonLd({ origin: data.origin, path: "/area-code", headline: title, description }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<article class="prose">
	<h1>U.S. area code directory</h1>
	<div class="answer-box">
		<p class="answer-label">In short</p>
		<p>
			An area code tells you which U.S. numbering plan area a phone number was assigned in, not where a
			particular call actually came from. Caller ID is often spoofed. Each page here uses official NANPA
			data plus any recent community reports for numbers that start with that code.
		</p>
	</div>

	<form class="search-form" method="get" action={match.length === 3 ? `/area-code/${match}` : "/area-code"}>
		<label class="sr-only" for="npa-search">Area code</label>
		<input
			id="npa-search"
			name="npa"
			inputmode="numeric"
			maxlength="3"
			placeholder="Enter a 3-digit area code"
			bind:value={query}
		/>
		<button type="submit">Look up</button>
	</form>

	<p class="muted">
		Source: <a href={AREA_CODE_SOURCE.url} rel="noopener noreferrer">{AREA_CODE_SOURCE.name}</a>,
		file date {AREA_CODE_SOURCE.fileDate}. AREA_SERVED is blank in almost every official record, so these
		pages do not invent city lists.
	</p>

	<h2>Toll-free codes</h2>
	<p>
		These codes are used across the numbering plan, not in one state. Scammers and legitimate organizations
		both use them.
	</p>
	<p class="npa-row">
		{#each TOLL_FREE_CODES as code}
			<a href="/area-code/{code.npa}">{code.npa}</a>
		{/each}
	</p>

	<h2>Geographic area codes by state or territory</h2>
	{#each groups as group}
		<h3 id={group.state}>{group.stateName} ({group.state})</h3>
		<p class="npa-row">
			{#each group.codes as code}
				<a href="/area-code/{code.npa}">{code.npa}</a>
			{/each}
		</p>
	{/each}

	<h2>Frequently asked questions</h2>
	{#each faqs as faq}
		<h3>{faq.q}</h3>
		<p>{faq.a}</p>
	{/each}
</article>
