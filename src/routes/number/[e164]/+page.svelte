<script lang="ts">
	import AdSlot from '#lib/components/AdSlot.svelte';
	import AlertForm from '#lib/components/AlertForm.svelte';
	import ReportForm from '#lib/components/ReportForm.svelte';
	import { CATEGORIES, categoryLabel, type CategoryId } from '#lib/categories';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: data.title,
		description: data.description,
		url: data.canonical,
		about: {
			'@type': 'Thing',
			name: data.international,
			identifier: data.e164
		}
	});

	function formatWhen(value: string) {
		return new Date(value).toLocaleString('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'America/Chicago'
		});
	}
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonical} />
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="og:url" content={data.canonical} />
	<meta property="og:type" content="website" />
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<p class="muted">Community lookup</p>
<h1>{data.national}</h1>
<p class="lede">
	{data.international}. These reports are user-submitted opinions. NoSpamCalls does not verify the caller’s identity
	and cannot promise the calls will stop.
</p>

{#if data.reported}
	<p class="form-success" role="status">Your report is on this page.</p>
{/if}

<div class="stats">
	<span class="stat"><strong>{data.summary.total}</strong> report{data.summary.total === 1 ? '' : 's'}</span>
	{#each CATEGORIES as category}
		{#if data.summary.byCategory[category.id]}
			<span class="stat">{category.label}: {data.summary.byCategory[category.id]}</span>
		{/if}
	{/each}
</div>

<AdSlot />

<section>
	<h2>Recent comments</h2>
	{#if data.summary.recent.length === 0}
		<p>No comments yet. If this number called you, you can be the first to report it.</p>
	{:else}
		<ul class="comments">
			{#each data.summary.recent as report}
				<li>
					<p>
						<strong>{categoryLabel(report.category as CategoryId)}</strong>
						<time datetime={report.created_at}>{formatWhen(report.created_at)} CT</time>
					</p>
					{#if report.comment}
						<p>{report.comment}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section>
	<h2>Report this number</h2>
	<ReportForm number={data.national} {form} action="?/create" />
</section>

<section>
	<h2>Get alerts if this number is reported again</h2>
	<p>
		Optional. We will only email you about this number, and only after an email service is connected. We
		are not sending those alerts yet.
	</p>
	<AlertForm number={data.national} {form} />
</section>

<p><a href="/protect">Get a free spam-protection plan</a> for the next unwanted call.</p>
