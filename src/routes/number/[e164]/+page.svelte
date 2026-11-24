<script lang="ts">
	import AdSlot from '#lib/components/AdSlot.svelte';
	import AlertForm from '#lib/components/AlertForm.svelte';
	import ReportForm from '#lib/components/ReportForm.svelte';
	import { CATEGORIES, categoryLabel, type CategoryId } from '#lib/categories';
	import { onMount } from 'svelte';
	import { getAccountKey, postJson, setAccountKey } from '#lib/account';
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

	let blockMsg = $state('');
	let blockBusy = $state(false);
	let key = $state('');
	onMount(() => (key = getAccountKey()));
	async function addToBlocklist() {
		blockBusy = true;
		blockMsg = '';
		try {
			const res = await postJson<{ key: string; already: boolean }>('/api/blocklist', { key: key || getAccountKey(), number: data.e164, callType: 'robocall' });
			key = res.key;
			setAccountKey(res.key);
			blockMsg = res.already ? 'Already on your blocklist.' : 'Blocked on your list.';
		} catch (err) {
			blockMsg = (err as Error).message;
		} finally {
			blockBusy = false;
		}
	}

	function formatDay(value: string) {
		return new Date(value).toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'America/Chicago' });
	}

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

<p class="muted">Spam number lookup</p>
<h1>{data.national}</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		{#if data.gov && data.gov.total_gov_count}
			{data.national} appears in <strong>{data.gov.total_gov_count}</strong> federal unwanted-call complaint{data.gov.total_gov_count === 1 ? '' : 's'}
			(FTC: {data.gov.ftc_count}, FCC: {data.gov.fcc_count}){#if data.gov.last_reported_at}, most recently on {formatDay(data.gov.last_reported_at)}{/if}{#if data.gov.top_subject}, about “{data.gov.top_subject}”{/if}.
		{:else}
			{data.national} has no FTC or FCC complaints in our data yet.
		{/if}
		It has {data.summary.total} community report{data.summary.total === 1 ? '' : 's'} on NoSpamCalls. Caller ID can be spoofed, so the
		number may not belong to the company that called.
	</p>
</div>
<p class="lede">
	{data.international}. Community reports are user-submitted opinions. NoSpamCalls does not verify the caller’s identity
	and cannot promise the calls will stop.
</p>

<div class="btn-row">
	<button class="btn" type="button" onclick={addToBlocklist} disabled={blockBusy}>{blockBusy ? 'Adding…' : 'Add to my blocklist'}</button>
	<a class="btn secondary" href={`/get-paid?number=${encodeURIComponent(data.e164)}#log`}>Log for TCPA claim</a>
	{#if blockMsg}<span class="form-success" role="status">{blockMsg} <a href="/blocklist">Download .vcf</a></span>{/if}
</div>

{#if data.gov && data.gov.total_gov_count}
	<section>
		<h2>Federal complaints (FTC + FCC)</h2>
		<table class="data-table">
			<tbody>
				<tr><th>Total federal complaints</th><td>{data.gov.total_gov_count}</td></tr>
				<tr><th>FTC Do Not Call reports</th><td>{data.gov.ftc_count}</td></tr>
				<tr><th>FCC unwanted-call complaints</th><td>{data.gov.fcc_count}</td></tr>
				{#if data.gov.last_reported_at}<tr><th>Latest complaint</th><td>{formatDay(data.gov.last_reported_at)}</td></tr>{/if}
				{#if data.gov.first_reported_at}<tr><th>First complaint in our data</th><td>{formatDay(data.gov.first_reported_at)}</td></tr>{/if}
				{#if data.gov.top_subject}<tr><th>Latest complaint topic</th><td>{data.gov.top_subject}</td></tr>{/if}
				{#if data.gov.top_method}<tr><th>Call type</th><td>{data.gov.top_method}</td></tr>{/if}
				{#if data.gov.sample_state}<tr><th>Sample complainant location</th><td>{data.gov.sample_city ? `${data.gov.sample_city}, ` : ''}{data.gov.sample_state}</td></tr>{/if}
			</tbody>
		</table>
		<p class="muted">Source: FCC Consumer Complaints open data and the FTC Do Not Call Reported Calls Data API. Complaints are unverified consumer reports.</p>
	</section>
{/if}

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

<p><a href="/protect">Get a free spam-protection plan</a> for the next unwanted call, set up <a href="/setup">phone and carrier blocking</a>, or <a href="/report-spam-calls">report it to the FTC and FCC</a>.</p>
