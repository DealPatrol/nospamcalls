<script lang="ts">
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import EmailCaptureBar from "#lib/components/EmailCaptureBar.svelte";
	import { BROKERS, BROKERS_CHECKED } from "#lib/content/brokers";
	import { STATE_LAWS, US_STATES, brokerSearchLinks } from "#lib/content/state-privacy";
	import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, type Crumb } from "#lib/seo";
	import { PAID_CHECKED } from "#lib/content/paid-features";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const path = "/exposure-check";
	const canonical = $derived(`${data.origin}${path}`);
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: path, label: "People-search exposure check" }
	];
	const title = "Free People-Search Exposure Check & State Privacy Deletion Packet";
	const description =
		"See where your name, phone, and address show up on people-search sites like Spokeo, Whitepages, and TruePeopleSearch — free, with nothing sent to our servers — check whether your state has a privacy deletion law, and print a ready-to-send deletion packet.";

	// Everything below runs only in your browser. Your name, city, phone, and address are never sent to NoSpamCalls.
	let first = $state("");
	let last = $state("");
	let usState = $state("TX");
	let city = $state("");
	let phone = $state("");
	let email = $state("");
	let address = $state("");
	let started = $state(false);
	let status = $state<Record<string, "found" | "clear" | undefined>>({});
	let copied = $state(false);

	const stateName = $derived(US_STATES.find(([c]) => c === usState)?.[1] ?? usState);
	const law = $derived(STATE_LAWS[usState]);
	const links = $derived(first.trim() && last.trim() ? brokerSearchLinks(first, last, usState, stateName, city) : []);
	const found = $derived(links.filter((l) => status[l.slug] === "found"));
	const optOut = (slug: string) => BROKERS.find((b) => b.slug === slug);

	function start(event: SubmitEvent) {
		event.preventDefault();
		started = true;
		status = {};
	}

	const fullName = $derived(`${first.trim()} ${last.trim()}`.trim() || "[your full name]");
	const subject = $derived(`Request to delete my personal information${law ? ` under the ${law.abbr}` : ""}`);
	const letter = $derived(
		`To the privacy team:

I am a ${stateName} resident. ${law ? `Under the ${law.name} (${law.cite}), I request that you:` : "I request that you:"}

1. Delete all personal information you hold about me, including any people-search profile, listing, or report.
2. Stop selling or sharing my personal information and opt me out of targeted advertising and profiling.
3. Tell any service providers or third parties you shared it with to delete it too.
4. Confirm in writing when this is done.${law ? "\n\nThe law generally requires a response within 45 days." : ""}

Use the following only to find and remove my records:
Name: ${fullName}
${city ? `City/State: ${city}, ${usState}` : `State: ${usState}`}
Phone: ${phone || "[your phone number]"}
Email: ${email || "[your email]"}${address ? `\nAddress: ${address}` : ""}

Thank you,
${fullName}`
	);

	async function copyLetter() {
		await navigator.clipboard.writeText(`Subject: ${subject}\n\n${letter}`);
		copied = true;
		setTimeout(() => (copied = false), 2500);
	}

	const steps = [
		{ name: "Search yourself", text: "Enter your name and state. We build direct search links for Spokeo, TruePeopleSearch, FastPeopleSearch, USPhoneBook, PeopleFinders, FastBackgroundCheck, Whitepages, and Google. Your name never leaves your browser." },
		{ name: "Mark where you appear", text: "Open each link and mark Found or Not found. Found listings go into your removal packet with each site’s official opt-out page." },
		{ name: "Check your state law", text: "See whether your state has a comprehensive privacy law with a right to delete, and its citation." },
		{ name: "Send your packet", text: "Use each site’s opt-out form, or copy, print, or email the pre-filled deletion letter. Re-check every 90 days — listings come back." }
	];
	const faqs = [
		{ q: "How do I find out which people-search sites have my information?", a: "Search for yourself on the biggest sites — Spokeo, TruePeopleSearch, FastPeopleSearch, USPhoneBook, PeopleFinders, FastBackgroundCheck, and Whitepages — plus Google. This page builds those search links for you from your name and state, in your browser, so you can check each one in about five minutes." },
		{ q: "Does NoSpamCalls store my name?", a: "No. The name, city, phone, and address fields on this page are used only inside your browser to build links and your letter. They are never sent to NoSpamCalls. The links open each people-search site directly." },
		{ q: "Which states have a privacy law that lets me demand deletion?", a: "As of November 2026, 19 states have comprehensive consumer privacy laws in effect with a right to delete: California, Colorado, Connecticut, Delaware, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, and Virginia. Indiana, Kentucky, and Rhode Island took effect January 1, 2026. Each law has its own thresholds and exemptions, so not every company is covered." },
		{ q: "What if my state doesn’t have a privacy law?", a: "You can still remove yourself. Most people-search sites offer their opt-out form to anyone. Use each site’s official opt-out page and send the general deletion letter. Californians can also use the state’s free DROP platform to reach every registered data broker at once." },
		{ q: "Is this the same as DeleteMe or Incogni?", a: `It’s the do-it-yourself version of their first step. Paid services like DeleteMe ($129/yr) and Incogni ($95.88/yr) scan and send removals for you and re-check over time. This page finds your listings and builds your requests for free; you submit them yourself. Prices checked ${PAID_CHECKED}.` }
	];
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		webAppJsonLd({ origin: data.origin, path, name: "NoSpamCalls people-search exposure check", description }),
		howToJsonLd({ name: "How to find and remove your information from people-search sites", description, steps }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<h1>Free people-search exposure check &amp; privacy deletion packet</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		Enter your name and state to open “search yourself” links on 7 major people-search sites plus Google, mark where your phone
		and address appear, see whether your state’s privacy law gives you a right to delete, and print a pre-filled deletion
		packet with each site’s official opt-out page. Everything runs in your browser — your name is never sent to us. Paid
		services like DeleteMe and Incogni sell this scan; it’s free here.
	</p>
</div>

<section class="hero-grid no-print">
	<form class="tool-form tool-card" onsubmit={start}>
		<h2>1. Who to search for</h2>
		<div class="btn-row">
			<label><span>First name</span><input type="text" bind:value={first} required maxlength="40" autocomplete="given-name" /></label>
			<label><span>Last name</span><input type="text" bind:value={last} required maxlength="40" autocomplete="family-name" /></label>
		</div>
		<label>
			<span>State</span>
			<select bind:value={usState}>{#each US_STATES as [code, nm]}<option value={code}>{nm}</option>{/each}</select>
		</label>
		<label><span>City (optional, narrows results)</span><input type="text" bind:value={city} maxlength="60" autocomplete="address-level2" /></label>
		<button class="btn" type="submit">Build my search links</button>
		<p class="muted">🔒 Runs only in your browser. Nothing on this form is sent to NoSpamCalls.</p>
	</form>

	<div class="tool-card">
		<h2>Your state: {stateName}</h2>
		{#if law}
			<p><span class="pill ok">Privacy law in effect</span></p>
			<p><strong>{law.name}</strong> ({law.abbr}), {law.cite}. In effect since {law.effective}. It gives residents a right to ask covered companies to delete personal data, generally with a 45-day response window.</p>
		{:else}
			<p><span class="pill">No comprehensive privacy law yet</span></p>
			<p>{stateName} doesn’t have a comprehensive consumer privacy law in effect. You can still use each site’s opt-out form — most offer it to anyone — and send the general deletion letter below.</p>
		{/if}
		{#if usState === "CA"}
			<p><strong>California bonus:</strong> file one free request on <a href="https://privacy.ca.gov/drop/" rel="noopener noreferrer">California DROP</a> to reach every registered data broker.</p>
		{/if}
		<p class="muted">Law list checked against Foley &amp; Lardner’s state privacy law chart and the IAPP on November 23, 2026. Not legal advice.</p>
	</div>
</section>

{#if started && links.length}
	<section class="no-print">
		<h2>2. Search yourself on each site</h2>
		<p>Open each link in a new tab. If you see your current or past phone, address, or relatives, mark it <strong>Found</strong>.</p>
		<div class="table-wrap">
			<table class="data-table">
				<thead><tr><th>Site</th><th>Search</th><th>Result</th><th>Official opt-out</th></tr></thead>
				<tbody>
					{#each links as l}
						{@const b = optOut(l.slug)}
						<tr>
							<td><strong>{l.name}</strong></td>
							<td><a href={l.url} target="_blank" rel="noopener noreferrer nofollow">Search {fullName}</a></td>
							<td>
								<div class="btn-row">
									<button type="button" class="btn small secondary" aria-pressed={status[l.slug] === "found"} onclick={() => (status = { ...status, [l.slug]: "found" })}>Found</button>
									<button type="button" class="btn small secondary" aria-pressed={status[l.slug] === "clear"} onclick={() => (status = { ...status, [l.slug]: "clear" })}>Not found</button>
								</div>
							</td>
							<td>{#if b}<a href={b.optOutUrl} target="_blank" rel="noopener noreferrer">Opt-out page</a>{:else if l.slug === "google"}<a href="https://support.google.com/websearch/answer/12719076" target="_blank" rel="noopener noreferrer">Results about you</a>{:else}—{/if}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="muted">Some sites show a “verify you’re human” check first. Broker links and opt-out pages checked {BROKERS_CHECKED}. PeopleConnect’s one suppression request covers Intelius, Instant Checkmate, TruthFinder, and US Search — <a href="/opt-out">see all 14 opt-outs</a>.</p>
		<p><strong>{found.length}</strong> of {links.length} sites marked Found.</p>
	</section>

	<section>
		<h2 class="no-print">3. Your deletion packet</h2>
		<div class="tool-form no-print">
			<div class="btn-row">
				<label><span>Phone to remove (optional)</span><input type="tel" bind:value={phone} maxlength="30" autocomplete="tel" /></label>
				<label><span>Email for confirmations (optional)</span><input type="email" bind:value={email} maxlength="120" autocomplete="email" /></label>
			</div>
			<label><span>Address to remove (optional)</span><input type="text" bind:value={address} maxlength="160" autocomplete="street-address" /></label>
		</div>
		<div class="tool-card">
			<h3 class="print-only">Personal data deletion packet — {fullName}</h3>
			<p><strong>Subject:</strong> {subject}</p>
			<pre class="notice" style="white-space: pre-wrap; font-family: inherit;">{letter}</pre>
			{#if found.length}
				<h3>Sites to send it to</h3>
				<ol>
					{#each found as l}
						{@const b = optOut(l.slug)}
						<li><strong>{l.name}</strong>{#if b}: {b.steps} Opt-out: {b.optOutUrl}{#if b.email} · Email: {b.email}{/if}{/if}</li>
					{/each}
				</ol>
			{/if}
			<div class="btn-row no-print">
				<button type="button" class="btn" onclick={copyLetter}>{copied ? "Copied" : "Copy letter"}</button>
				<button type="button" class="btn secondary" onclick={() => window.print()}>Print / save as PDF</button>
				<a class="btn secondary" href={`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(letter)}`}>Open in my email</a>
			</div>
			<p class="muted">Educational self-help template, not legal advice. Send it from your own email. Each law has thresholds and exemptions, so some companies may not be covered.</p>
		</div>
	</section>
{/if}

<EmailCaptureBar
	headline="Get a free reminder in 90 days to re-check — people-search listings come back"
	sub="A reminder every 90 days to re-check, plus vote on Pro: done-for-you broker removal. Unsubscribe anytime."
	leadMagnet="exposure_check"
	contextValue={usState}
	button="Remind me in 90 days"
	unlockedText="We’ll remind you to re-check in 90 days."
/>

<Faq {faqs} />
<p>Related: <a href="/opt-out">full data-broker opt-out center</a> · <a href="/stop-spam-calls">stop spam calls</a> · <a href="/compare">paid removal services compared</a></p>
