<script lang="ts">
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import EmailCaptureBar from "#lib/components/EmailCaptureBar.svelte";
	import UnlockGate from "#lib/components/UnlockGate.svelte";
	import { breadcrumbJsonLd, faqJsonLd, type Crumb } from "#lib/seo";
	import { e164ToSlug, formatNational } from "#lib/phone";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const idx = $derived(data.index);
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/spam-call-data", label: "Spam call data index" }
	];
	const nf = (n: number) => n.toLocaleString("en-US");
	const day = (iso: string | null) =>
		iso ? new Date(iso).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "America/Chicago" }) : "—";
	const title = "Live US Spam Call & Robocall Data Index (2026)";
	const description = $derived(
		idx
			? `${nf(idx.numbers)} phone numbers from ${nf(idx.complaints)} FCC and FTC unwanted-call complaints: the most-reported spam numbers, caller area codes, complainant states, and complaint topics. Updated daily.`
			: "Live index of the most-reported U.S. spam and robocall numbers from FCC and FTC complaint data, updated daily."
	);
	const canonical = $derived(`${data.origin}/spam-call-data`);
	const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : "—");

	const faqs = $derived([
		{
			q: "What number gets the most spam call complaints right now?",
			a: idx && idx.top[0]
				? `In our current data, ${formatNational(idx.top[0].e164)} has the most federal complaints: ${nf(idx.top[0].total_gov_count)}${idx.top[0].top_subject ? `, mostly about “${idx.top[0].top_subject}”` : ""}. Caller ID can be spoofed, so the number may not belong to the company that called.`
				: "See the table on this page; it is computed live from FCC and FTC complaint data."
		},
		{
			q: "Where does this spam call data come from?",
			a: "From two public federal sources: the FCC Consumer Complaints open dataset (complaints with the issue “Unwanted Calls”) and the FTC Do Not Call Reported Calls Data API. NoSpamCalls refreshes both every day and counts each complaint once."
		},
		{
			q: "Why do toll-free area codes like 866, 877, and 833 rank so high?",
			a: "Many complaints are about calls showing toll-free caller IDs, which are cheap to obtain in bulk and often used by robocall campaigns. The area code shown is the caller ID on the complaint, not where the caller really is."
		},
		{
			q: "Can I use or cite this data?",
			a: "Yes. Please cite “NoSpamCalls Spam Call Data Index” with a link to this page and note that it is built from FCC and FTC consumer complaints, which are unverified reports."
		}
	]);

	const datasetLd = $derived(
		idx
			? {
					"@context": "https://schema.org",
					"@type": "Dataset",
					name: "NoSpamCalls US Spam Call & Robocall Data Index",
					description,
					url: canonical,
					keywords: ["spam calls", "robocalls", "FCC complaints", "FTC Do Not Call", "phone scams"],
					creator: { "@type": "Organization", name: "NoSpamCalls", url: data.origin },
					isAccessibleForFree: true,
					dateModified: idx.lastIngest ?? undefined,
					temporalCoverage: idx.firstComplaint && idx.latestComplaint ? `${idx.firstComplaint.slice(0, 10)}/${idx.latestComplaint.slice(0, 10)}` : undefined,
					spatialCoverage: { "@type": "Place", name: "United States" },
					isBasedOn: [
						"https://opendata.fcc.gov/Consumer/CGB-Consumer-Complaints-Data/3xyp-aqkj",
						"https://catalog.data.gov/dataset/do-not-call-dnc-reported-calls-data-api"
					],
					variableMeasured: ["Federal complaint count per phone number", "FCC complaints", "FTC Do Not Call reports", "Complaint topic", "Call type"]
				}
			: null
	);
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[breadcrumbJsonLd(data.origin, crumbs), ...(datasetLd ? [datasetLd] : []), faqJsonLd(faqs)]}
/>
<Breadcrumbs {crumbs} />

<h1>Live US Spam Call &amp; Robocall Data Index (2026)</h1>

{#if !idx}
	<p>The data index is temporarily unavailable. Please try again in a few minutes.</p>
{:else}
	<div class="answer-box">
		<p class="answer-label">In short</p>
		<p>
			NoSpamCalls tracks <strong>{nf(idx.numbers)}</strong> phone numbers named in <strong>{nf(idx.complaints)}</strong> FCC and FTC
			unwanted-call complaints. <strong>{nf(idx.repeatNumbers)}</strong> numbers have two or more complaints. The most-reported number
			right now is <a href={`/number/${e164ToSlug(idx.top[0].e164)}`}>{formatNational(idx.top[0].e164)}</a> with
			{nf(idx.top[0].total_gov_count)} complaints. The latest complaint in the data is from {day(idx.latestComplaint)}.
		</p>
	</div>

	<div class="stat-grid">
		<div class="stat-box"><strong>{nf(idx.numbers)}</strong>unique reported numbers</div>
		<div class="stat-box"><strong>{nf(idx.complaints)}</strong>federal complaints counted</div>
		<div class="stat-box"><strong>{nf(idx.fccComplaints)}</strong>FCC complaints ({pct(idx.fccComplaints, idx.complaints)})</div>
		<div class="stat-box"><strong>{nf(idx.ftcComplaints)}</strong>FTC Do Not Call reports ({pct(idx.ftcComplaints, idx.complaints)})</div>
		<div class="stat-box"><strong>{nf(idx.repeatNumbers)}</strong>numbers with 2+ complaints</div>
		<div class="stat-box"><strong>{day(idx.latestComplaint)}</strong>latest complaint</div>
	</div>

	<section>
		<h2>Top 25 most-reported spam numbers</h2>
		<div class="table-wrap">
			<table class="data-table">
				<thead><tr><th>#</th><th>Number</th><th>Federal complaints</th><th>FCC / FTC</th><th>Latest topic</th><th>Call type</th><th>Latest complaint</th></tr></thead>
				<tbody>
					{#each idx.top as n, i}
						<tr>
							<td>{i + 1}</td>
							<td><a href={`/number/${e164ToSlug(n.e164)}`}>{formatNational(n.e164)}</a></td>
							<td>{nf(n.total_gov_count)}</td>
							<td>{n.fcc_count} / {n.ftc_count}</td>
							<td>{n.top_subject ?? "—"}</td>
							<td>{n.top_method ?? "—"}</td>
							<td>{day(n.last_reported_at)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<UnlockGate
			headline="Download the top 500 spam numbers (CSV) — free"
			sub="One email unlocks the CSV and every free download on NoSpamCalls, plus weekly spam alerts."
			leadMagnet="data_index"
			button="Unlock CSV"
		>
			<div class="btn-row">
				<a class="btn" href="/api/top-spam-numbers.csv" download>Download top 500 (CSV)</a>
				<a class="btn secondary" href="/api/blocklist.vcf?includeTop=1" download="nospamcalls-blocklist.vcf">Top-100 blocklist (.vcf)</a>
			</div>
		</UnlockGate>
	</section>

	<div class="hero-grid">
		<section>
			<h2>Top 15 caller area codes in complaints</h2>
			<p class="muted">Area code of the caller ID on the complaint. Caller IDs are often spoofed or toll-free.</p>
			<table class="data-table">
				<thead><tr><th>Area code</th><th>Numbers</th><th>Complaints</th></tr></thead>
				<tbody>
					{#each idx.areaCodes as a}
						<tr>
							<td>{#if data.areaPages[a.npa]}<a href={`/area-code/${a.npa}`}>{a.npa}</a>{:else}{a.npa}{/if}</td>
							<td>{nf(a.numbers)}</td>
							<td>{nf(a.complaints)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
		<section>
			<h2>Top 15 complainant states</h2>
			<p class="muted">State of the person who complained (latest complaint location recorded per number).</p>
			<table class="data-table">
				<thead><tr><th>State</th><th>Numbers reported</th><th>Complaints on those numbers</th></tr></thead>
				<tbody>
					{#each idx.states as st}
						<tr><td>{st.state}</td><td>{nf(st.numbers)}</td><td>{nf(st.complaints)}</td></tr>
					{/each}
				</tbody>
			</table>
		</section>
	</div>

	<div class="hero-grid">
		<section>
			<h2>Top complaint topics</h2>
			<table class="data-table">
				<thead><tr><th>Topic (latest per number)</th><th>Numbers</th><th>Complaints</th></tr></thead>
				<tbody>
					{#each idx.subjects as s}<tr><td>{s.label}</td><td>{nf(s.numbers)}</td><td>{nf(s.complaints)}</td></tr>{/each}
				</tbody>
			</table>
		</section>
		<section>
			<h2>Call methods</h2>
			<table class="data-table">
				<thead><tr><th>Method (latest per number)</th><th>Numbers</th><th>Complaints</th></tr></thead>
				<tbody>
					{#each idx.methods as m}<tr><td>{m.label}</td><td>{nf(m.numbers)}</td><td>{nf(m.complaints)}</td></tr>{/each}
				</tbody>
			</table>
		</section>
	</div>

	<EmailCaptureBar
		headline="Get the weekly spam call report — free"
		sub="New top spam numbers, scam topics on the rise, and new TCPA settlements, in one short weekly email."
		leadMagnet="data_index"
		contextValue="weekly_report"
		button="Send me the report"
		unlockedText="You’ll get the weekly spam call report."
		alwaysAsk
	/>

	<section class="prose">
		<h2>Data methodology &amp; official sources</h2>
		<ul>
			<li>
				<strong>FCC:</strong> <a href="https://opendata.fcc.gov/Consumer/CGB-Consumer-Complaints-Data/3xyp-aqkj" rel="noopener noreferrer">Consumer Complaints Data</a>
				(issue “Unwanted Calls”), using the caller ID and advertiser phone number fields.
			</li>
			<li>
				<strong>FTC:</strong> <a href="https://catalog.data.gov/dataset/do-not-call-dnc-reported-calls-data-api" rel="noopener noreferrer">Do Not Call Reported Calls Data</a>
				via the public <code>api.ftc.gov/v0/dnc-complaints</code> API.
			</li>
			<li>Refreshed daily. Each complaint is counted once (deduplicated by its official complaint ID).</li>
			<li>Rows with invalid, fictional (555), or malformed U.S. numbers are excluded.</li>
			<li>
				Complaints are unverified consumer reports. Caller ID is frequently spoofed, so a number here may not belong to the
				company that called. Topics and call types are the latest reported for each number.
			</li>
			<li>FTC coverage is currently smaller than FCC coverage because of public API rate limits.</li>
			<li>Data range in this index: {day(idx.firstComplaint)} to {day(idx.latestComplaint)}. Last refresh: {day(idx.lastIngest)}.</li>
		</ul>
		<h2>How to cite</h2>
		<pre class="code">NoSpamCalls. “Live US Spam Call &amp; Robocall Data Index.” {data.origin}/spam-call-data (accessed {day(new Date().toISOString())}). Built from FCC Consumer Complaints and FTC Do Not Call Reported Calls data.</pre>
	</section>
{/if}

<Faq faqs={faqs} />
<p>Related: <a href="/blocklist">block these numbers</a> · <a href="/get-paid">get paid from illegal robocalls</a> · <a href="/compare">best spam blockers compared</a> · <a href="/area-code">area-code directory</a> · <a href="/report-spam-calls">report spam to the FTC and FCC</a></p>
