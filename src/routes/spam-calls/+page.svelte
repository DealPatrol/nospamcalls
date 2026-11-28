<script lang="ts">
	import Breadcrumbs from '#lib/components/Breadcrumbs.svelte';
	import SeoHead from '#lib/components/SeoHead.svelte';
	import { STATE_ENTRIES, stateAreaCodes, stateSpamPath } from '#lib/content/state-spam';
	import { breadcrumbJsonLd, faqJsonLd, type Crumb } from '#lib/seo';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const title = 'Spam calls by state: reported numbers and area codes';
	const description =
		'Pick your state to see the most-reported spam numbers in FTC and FCC complaints from that state, its area codes, and free steps to block and report robocalls.';
	const crumbs: Crumb[] = [
		{ href: '/', label: 'Home' },
		{ href: '/spam-calls', label: 'Spam calls by state' }
	];
	const faqs = [
		{
			q: 'How are numbers assigned to a state?',
			a: 'A number is listed for a state when the most recent FTC or FCC complaint about it came from someone in that state. The caller may be anywhere, and caller ID can be spoofed.'
		}
	];
	const jsonLd = $derived([breadcrumbJsonLd(data.origin, crumbs), faqJsonLd(faqs)]);
</script>

<SeoHead {title} {description} canonical={`${data.origin}/spam-calls`} {jsonLd} />
<Breadcrumbs {crumbs} />

<article class="prose">
	<h1>Spam calls by state</h1>
	<p>
		Each state page lists the most-reported numbers in federal complaints from that state, the
		state’s area codes from NANPA, and free steps to block and report spam calls.
	</p>
	<ul class="state-list">
		{#each STATE_ENTRIES as st}
			<li>
				<a href={stateSpamPath(st)}>{st.name}</a>
				<span class="muted">
					({stateAreaCodes(st.abbr)
						.map((c) => c.npa)
						.join(', ')})
				</span>
			</li>
		{/each}
	</ul>
	<h2>FAQ</h2>
	{#each faqs as f}
		<h3>{f.q}</h3>
		<p>{f.a}</p>
	{/each}
</article>
