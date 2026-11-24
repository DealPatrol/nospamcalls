<script lang="ts">
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import Disclaimer from "#lib/components/Disclaimer.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import TopicCta from "#lib/components/TopicCta.svelte";
	import EmailCaptureBar from "#lib/components/EmailCaptureBar.svelte";
	import { AREA_CODE_SOURCE } from "#lib/data/area-codes";
	import { e164ToSlug, formatNational } from "#lib/phone";
	import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, type Crumb } from "#lib/seo";
	import { categoryLabel } from "#lib/categories";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const code = $derived(data.code);
	const place = $derived(
		code.kind === "toll-free" ? "U.S. and Canada toll-free" : code.stateName
	);
	const title = $derived(
		code.kind === "toll-free"
			? `Area code ${code.npa}: toll-free numbers, time zone notes, and reports`
			: `Area code ${code.npa} (${place}): time zone, overlays, and reported calls`
	);
	const description = $derived(
		code.kind === "toll-free"
			? `${code.npa} is an in-service North American toll-free code, not a state area code. See official NANPA facts and recent community reports. Caller ID can be spoofed.`
			: `Area code ${code.npa} is an in-service U.S. geographic code in ${place}, in the ${code.timeZone} zone according to NANPA. See overlay notes and recent community reports. Caller ID can be spoofed.`
	);
	const headline = $derived(
		code.kind === "toll-free" ? `Area code ${code.npa} (toll-free)` : `Area code ${code.npa} — ${place}`
	);
	const crumbs: Crumb[] = $derived([
		{ href: "/", label: "Home" },
		{ href: "/area-code", label: "Area codes" },
		{ href: `/area-code/${code.npa}`, label: code.npa }
	]);
	const canonical = $derived(`${data.origin}/area-code/${code.npa}`);
	const faqs = $derived([
		{
			q: `Does a call from area code ${code.npa} mean the caller is in ${place}?`,
			a: "No. Caller ID can be spoofed. Scammers often display a local or familiar area code even when the call is not coming from there."
		},
		{
			q: `Where does the information on area code ${code.npa} come from?`,
			a: `The numbering facts come from the official NANPA NPA database (file date ${AREA_CODE_SOURCE.fileDate}). Community reports, if any, come from people who submitted numbers to NoSpamCalls. We do not invent city lists or unofficial local scam statistics.`
		}
	]);
	const overlayText = $derived.by(() => {
		if (!code.overlay && !code.overlays.length && !code.parent) return "";
		const sisters = code.overlays.filter((n) => n !== code.npa);
		const bits: string[] = [];
		if (code.overlay || sisters.length) {
			bits.push(
				sisters.length
					? `NANPA lists this as an overlay area. Related codes include ${sisters.map((n) => n).join(", ")}.`
					: "NANPA lists this as an overlay area code."
			);
		}
		if (code.parent) bits.push(`The parent NPA in the official record is ${code.parent}.`);
		if (code.dialing) bits.push(`Home-NPA local dialing in the official record is ${code.dialing}.`);
		if (code.dialingNotes) bits.push(code.dialingNotes);
		return bits.join(" ");
	});
	const jsonLd = $derived([
		breadcrumbJsonLd(data.origin, crumbs),
		articleJsonLd({
			origin: data.origin,
			path: `/area-code/${code.npa}`,
			headline,
			description
		}),
		faqJsonLd(faqs)
	]);
</script>

<SeoHead {title} {description} {canonical} jsonLd={jsonLd} />
<Breadcrumbs {crumbs} />

<article class="prose">
	<h1>{headline}</h1>
	<div class="answer-box">
		<p class="answer-label">In short</p>
		{#if code.kind === "toll-free"}
			<p>
				{code.npa} is an in-service toll-free code in the North American Numbering Plan. It is not assigned
				to a single state. Seeing {code.npa} on caller ID does not prove the call is official or local.
				Look the full number up, and do not assume a government or company is calling you.
			</p>
		{:else}
			<p>
				Area code {code.npa} is an in-service U.S. geographic numbering plan area in {place}. Official NANPA
				records place it in the {code.timeZone} zone. Seeing {code.npa} on caller ID does not prove the
				caller is in {place}, because numbers are routinely spoofed.
			</p>
		{/if}
		{#if data.gov.total}
			<p>
				In FTC and FCC unwanted-call complaints, {data.gov.total.toLocaleString("en-US")} reported caller
				number{data.gov.total === 1 ? "" : "s"} start with {code.npa}, across {data.gov.complaints.toLocaleString("en-US")}
				complaint{data.gov.complaints === 1 ? "" : "s"}.
			</p>
		{/if}
	</div>
	<EmailCaptureBar
		headline={`Get free weekly spam alerts & top blocked numbers for the ${code.npa} area code.`}
		sub="Plus our free Top-100 Active Spammers blocklist (.vcf). One email, unsubscribe anytime."
		leadMagnet="area_code_alert"
		contextValue={code.npa}
		button="Alert me free"
		unlockedText={`We’ll include ${code.npa} in your weekly spam alerts.`}
		alwaysAsk
	/>
	<Disclaimer />

	<h2>Official numbering facts</h2>
	<ul>
		<li>
			<strong>Status:</strong>
			{code.kind === "toll-free" ? "In-service toll-free code" : `In-service U.S. geographic code in ${place}`}
		</li>
		{#if code.inServiceDate}
			<li><strong>In-service date (NANPA):</strong> {code.inServiceDate}</li>
		{/if}
		<li><strong>Time zone (NANPA):</strong> {code.timeZone}. {code.timeZoneNote}</li>
		{#if code.areaServed}
			<li><strong>Area served (NANPA):</strong> {code.areaServed}</li>
		{/if}
	</ul>
	{#if overlayText}
		<p>{overlayText}</p>
		{#if code.overlays.length}
			<p class="npa-row">
				Related codes:
				{#each code.overlays as npa}
					<a href="/area-code/{npa}">{npa}</a>
				{/each}
			</p>
		{/if}
	{/if}
	<p class="muted">
		Source: <a href={AREA_CODE_SOURCE.url} rel="noopener noreferrer">{AREA_CODE_SOURCE.name}</a>, file date
		{AREA_CODE_SOURCE.fileDate}. We do not add unofficial city lists when NANPA leaves AREA_SERVED blank.
	</p>

	<h2>Spoofing and scam calls</h2>
	<p>
		People often search “who called me from {code.npa}” after a missed or suspicious call. A local-looking
		code is a common trick, sometimes called neighbor spoofing. Treat unexpected calls that demand payment,
		personal data, or a callback to an unknown number with caution. See
		<a href="/scams">scam guides</a>, <a href="/scams/one-ring-wangiri">one-ring scams</a>, and
		<a href="/block-spam-calls">how to block spam calls</a>.
	</p>

	{#if data.gov.numbers.length}
		<h2>Most-reported {code.npa} numbers in federal complaints</h2>
		<div class="table-wrap">
			<table class="data-table">
				<thead><tr><th>Number</th><th>FTC + FCC complaints</th><th>Latest topic</th></tr></thead>
				<tbody>
					{#each data.gov.numbers as n}
						<tr>
							<td><a href="/number/{e164ToSlug(n.e164)}">{formatNational(n.e164)}</a></td>
							<td>{n.total_gov_count}</td>
							<td>{n.top_subject ?? "—"}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="muted">Source: FCC Consumer Complaints open data and the FTC Do Not Call Reported Calls API. Unverified consumer reports; caller ID can be spoofed. <a href="/spam-call-data">See the national data index</a>.</p>
	{/if}

	<h2>Community reports for this area code</h2>
	{#if data.reports.total === 0}
		<p>
			No community reports for numbers starting with {code.npa} have been filed on NoSpamCalls yet. That
			does not mean the code is unused in unwanted calls — many scam calls use spoofed numbers that nobody
			has logged here.
		</p>
	{:else}
		<p>
			{data.reports.total} community
			{data.reports.total === 1 ? "report" : "reports"} on NoSpamCalls start with {code.npa}. These are
			user-submitted and unverified. The number may still be spoofed.
		</p>
		<ul class="comments">
			{#each data.reports.recent as row}
				<li>
					<p>
						<a href="/number/{e164ToSlug(row.number_e164)}">{formatNational(row.number_e164)}</a>
						— {categoryLabel(row.category)}
					</p>
					{#if row.comment}
						<p>{row.comment}</p>
					{/if}
					<p class="muted">
						<time datetime={row.created_at}>{new Date(row.created_at).toLocaleString()}</time>
					</p>
				</li>
			{/each}
		</ul>
	{/if}
	<p>
		<a href="/report">Report a number</a> or <a href="/">look up a full number</a>. To report a scam to
		the government, use <a href="/report-spam-calls">the official FTC and FCC steps</a>.
	</p>

	<div class="no-print">
		<TopicCta
			variant="protect"
			heading="Got a call from this area code?"
			body="Look up the full number, report it if it was a scam or robocall, and get a free two-minute plan for your phone and carrier. Seeing this area code on caller ID does not prove the caller is nearby."
			href="/protect"
			label="Get a free protection plan"
		/>
	</div>

	<h2>Frequently asked questions</h2>
	{#each faqs as faq}
		<h3>{faq.q}</h3>
		<p>{faq.a}</p>
	{/each}
</article>
