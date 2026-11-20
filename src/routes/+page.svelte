<script lang="ts">
	import SearchForm from '#lib/components/SearchForm.svelte';
	import AdSlot from '#lib/components/AdSlot.svelte';
	import { SITE_NAME } from '#lib/site';
</script>

<svelte:head>
	<title>{SITE_NAME} — Look up a spam call, then stop the next one</title>
	<meta
		name="description"
		content="Free community lookup for spam, scam, and robocall numbers. Report a caller and get a plain-English guide to Do Not Call registration, carrier tools, and data-broker opt-outs."
	/>
</svelte:head>

<section class="hero">
	<p class="muted">Free community lookup</p>
	<h1>Who called? Look it up. Report it. Learn how to stop the next one.</h1>
	<p class="lede">
		NoSpamCalls is a free directory of numbers people have reported as robocalls, scams, telemarketing,
		or debt collection. It does not block calls by itself, and it cannot promise that spam will stop.
	</p>
	<SearchForm />
</section>

<AdSlot />

<div class="grid-2">
	<article class="card">
		<h2>Report a number</h2>
		<p>If a call wasted your time or tried to trick you, add it to the public log so the next person can see it.</p>
		<p><a href="/report">File a report</a></p>
	</article>
	<article class="card">
		<h2>Stop spam calls</h2>
		<p>
			Register on the National Do Not Call list, turn on carrier and phone tools, and opt out of data-broker listings.
		</p>
		<p><a href="/stop-spam-calls">Read the free guide</a></p>
	</article>
	<article class="card">
		<h2>Is your business flagged “Scam Likely”?</h2>
		<p>Legitimate shops get mislabeled too. Join the waitlist for a number-reputation service.</p>
		<p><a href="/business">Business waitlist</a></p>
	</article>
</div>
