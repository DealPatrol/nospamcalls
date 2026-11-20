<script lang="ts">
	import SearchForm from "#lib/components/SearchForm.svelte";
	import AdSlot from "#lib/components/AdSlot.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import { SITE_NAME } from "#lib/site";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const title = `${SITE_NAME} — Look up a spam call, then stop the next one`;
	const description =
		"Free community lookup for spam, scam, and robocall numbers. Report a caller and get a plain-English guide to Do Not Call registration, carrier tools, and data-broker opt-outs.";
	const canonical = $derived(`${data.origin}/`);
</script>

<SeoHead {title} {description} {canonical} type="website" />

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
		<h2>Block spam calls</h2>
		<p>
			Use free iPhone, Android, AT&amp;T, Verizon, and T-Mobile tools, then register on the National Do Not
			Call list.
		</p>
		<p><a href="/block-spam-calls">See the block guides</a></p>
	</article>
	<article class="card">
		<h2>Common phone and text scams</h2>
		<p>
			IRS, Social Security, car warranty, fake bank alerts, unpaid-toll texts, one-ring calls, and more —
			with official FTC and FCC links.
		</p>
		<p><a href="/scams">Read the scam guides</a></p>
	</article>
	<article class="card">
		<h2>Look up an area code</h2>
		<p>
			Official NANPA facts for every in-service U.S. geographic area code, plus any recent community reports.
		</p>
		<p><a href="/area-code">Browse area codes</a></p>
	</article>
	<article class="card">
		<h2>What does “Scam Likely” mean?</h2>
		<p>It is a carrier warning, not a legal finding. Legitimate businesses sometimes get the same label.</p>
		<p><a href="/scam-likely">Read the explanation</a></p>
	</article>
	<article class="card">
		<h2>Is your business flagged “Scam Likely”?</h2>
		<p>Legitimate shops get mislabeled too. Join the waitlist for a number-reputation service.</p>
		<p><a href="/business">Business waitlist</a></p>
	</article>
</div>
