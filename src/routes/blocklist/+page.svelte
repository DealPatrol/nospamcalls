<script lang="ts">
	import { onMount } from "svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import QuickBlock from "#lib/components/QuickBlock.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import UnlockGate from "#lib/components/UnlockGate.svelte";
	import ProCallout from "#lib/components/ProCallout.svelte";
	import { getAccountKey, postJson } from "#lib/account";
	import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, type Crumb } from "#lib/seo";
	import { e164ToSlug, formatNational } from "#lib/phone";
	import type { PageProps } from "./$types";

	type Blocked = { e164: string; caller_label: string | null; call_type: string; note: string | null; created_at: string };
	let { data }: PageProps = $props();

	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/blocklist", label: "Block a number" }
	];
	const title = "Free spam call blocklist (.vcf) for iPhone & Android";
	const description =
		"Add any spam number that got through to your personal blocklist, then download one .vcf contact with your numbers plus the most-reported FTC and FCC robocall numbers and block it on your phone.";
	const canonical = $derived(`${data.origin}/blocklist`);

	let key = $state("");
	let numbers = $state<Blocked[]>([]);
	let loading = $state(true);
	let error = $state("");

	onMount(async () => {
		key = getAccountKey();
		try {
			const res = await fetch(`/api/blocklist?key=${key}`);
			const body = await res.json();
			if (res.ok) numbers = body.numbers;
		} finally {
			loading = false;
		}
	});

	async function remove(e164: string) {
		error = "";
		try {
			const res = await postJson<{ numbers: Blocked[] }>("/api/blocklist", { key, e164 }, "DELETE");
			numbers = res.numbers;
		} catch (err) {
			error = (err as Error).message;
		}
	}

	const steps = [
		{ name: "Add the number", text: "Enter the spam number that got through. It is saved to your personal blocklist instantly." },
		{ name: "Download the .vcf", text: "Tap Download blocklist. The file contains one contact called NoSpamCalls Blocklist with every number on your list." },
		{ name: "Import and block", text: "Open the file to add the contact, then open the contact and choose Block this Caller (iPhone) or Block numbers (Android)." }
	];
	const faqs = [
		{ q: "How do I block many spam numbers at once on iPhone?", a: "Import a .vcf file that holds all the numbers on one contact, then open that contact and tap Block this Caller. Blocking a contact blocks every number saved on it. After you download a newer list, import it again and block the updated contact." },
		{ q: "Will a blocklist stop every spam call?", a: "No. Many robocallers spoof a new caller ID for each call, so a list only stops repeat numbers. Pair it with your phone’s built-in screening (Silence or Screen Unknown Callers on iPhone, Call Screen on Android) and your carrier’s free spam filter — see the phone setup wizard." },
		{ q: "Where do the top numbers come from?", a: "From FCC Consumer Complaints open data (issue: Unwanted Calls) and the FTC Do Not Call Reported Calls Data API, refreshed daily. Only numbers with at least two complaints in the last 30 days are added to the free list." },
		{ q: "Do I need an account?", a: "No. Your list is tied to a random private key stored only in this browser, so nobody else can open it. Downloading the .vcf file asks for an email once; that unlocks every free download on the site." },
		{ q: "Can it block numbers automatically without re-importing?", a: "Not yet. Today you re-download and re-import the .vcf when your list grows. Automatic live call screening that blocks slipped-through numbers for you is planned for NoSpamCalls Pro, which is not launched and has no price yet." }
	];
	const vcfHref = $derived(key ? `/api/blocklist.vcf?key=${key}&includeTop=1` : "/api/blocklist.vcf?includeTop=1");
	const vcfMineOnly = $derived(key ? `/api/blocklist.vcf?key=${key}&includeTop=0` : "");
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		webAppJsonLd({ origin: data.origin, path: "/blocklist", name: "NoSpamCalls personal blocklist", description }),
		howToJsonLd({ name: "Block a list of spam numbers on your phone with a .vcf file", description, steps }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<h1>Block a number — and every number like it</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		Type in any spam number that got through and it goes on your personal blocklist right away. Download the list as a
		single .vcf contact — your numbers plus the most-reported FTC and FCC robocall numbers — import it, and block
		that contact so those numbers can’t ring again.
	</p>
</div>

<div class="hero-grid">
	<QuickBlock heading="A spam call got through" showDetails={true} initialNumber={data.prefill} onchange={(n, k) => { numbers = n; key = k; }} />
	<div class="tool-card">
		<h2>Your blocklist</h2>
		{#if loading}
			<p class="muted">Loading…</p>
		{:else if numbers.length === 0}
			<p>No numbers yet. Add one on the left, or download the free list of top reported numbers.</p>
		{:else}
			<p>{numbers.length} number{numbers.length === 1 ? "" : "s"} saved.</p>
			<div class="table-wrap">
				<table class="data-table">
					<thead><tr><th>Number</th><th>Type</th><th></th></tr></thead>
					<tbody>
						{#each numbers as n}
							<tr>
								<td><a href={`/number/${e164ToSlug(n.e164)}`}>{formatNational(n.e164)}</a>{#if n.caller_label}<br /><span class="muted">{n.caller_label}</span>{/if}</td>
								<td>{n.call_type.replace("_", " ")}</td>
								<td>
									<a class="btn small secondary" href={`/get-paid?number=${encodeURIComponent(n.e164)}#log`}>Start TCPA claim</a>
									<button class="btn small secondary" type="button" onclick={() => remove(n.e164)}>Remove</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
		{#if error}<p class="form-error">{error}</p>{/if}
		<UnlockGate
			headline="Download the free Top-100 Spammers + your personal blocklist (.vcf)"
			sub="One email unlocks the file now and every free download on the site. We’ll also send weekly scam alerts."
			leadMagnet="blocklist_vcf"
			button="Unlock download"
		>
			<div class="btn-row">
				<a class="btn" href={vcfHref} download="nospamcalls-blocklist.vcf">Download blocklist (.vcf)</a>
				{#if numbers.length}<a class="btn secondary" href={vcfMineOnly} download="nospamcalls-blocklist.vcf">Only my numbers</a>{/if}
			</div>
		</UnlockGate>
	</div>
</div>

<section class="prose">
	<h2>How to block the whole list</h2>
	<h3>iPhone</h3>
	<ol class="step-list">
		<li>Tap <strong>Download blocklist (.vcf)</strong>, then open the file and tap <strong>Add All Contacts</strong> (or Create New Contact).</li>
		<li>Open Contacts → <strong>NoSpamCalls Blocklist</strong> → scroll down → <strong>Block this Caller</strong>.</li>
		<li>When you download a newer list later, delete the old contact, import the new one, and block it again.</li>
	</ol>
	<h3>Android</h3>
	<ol class="step-list">
		<li>Download the .vcf, open it, and choose your Contacts app to import it.</li>
		<li>Open the <strong>NoSpamCalls Blocklist</strong> contact → menu (⋮) → <strong>Block numbers</strong> (wording varies by phone).</li>
		<li>Re-import after each update.</li>
	</ol>
	<p class="legal-note">
		Honest note: robocallers often fake (spoof) a different caller ID on every call, so no list catches everything. Turn on
		your phone’s built-in screening and your carrier’s free spam filter with the <a href="/setup">phone setup wizard</a>.
	</p>
</section>

{#if data.top.length}
	<section>
		<h2>Most-reported numbers in the last 30 days</h2>
		<p class="muted">
			From {data.gov.complaints.toLocaleString("en-US")} FCC and FTC complaints across {data.gov.numbers.toLocaleString("en-US")} numbers{#if data.gov.lastIngest}, updated {new Date(data.gov.lastIngest).toLocaleDateString("en-US", { timeZone: "America/Chicago" })}{/if}. Caller ID can be spoofed.
		</p>
		<div class="table-wrap">
			<table class="data-table">
				<thead><tr><th>Number</th><th>Federal complaints</th><th>Latest topic</th></tr></thead>
				<tbody>
					{#each data.top as n}
						<tr>
							<td><a href={`/number/${e164ToSlug(n.e164)}`}>{formatNational(n.e164)}</a></td>
							<td>{n.total_gov_count}</td>
							<td>{n.top_subject ?? "—"}{n.top_method ? ` · ${n.top_method}` : ""}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/if}

<ProCallout feature="Automatic live call screening" text="Pro will answer unknown callers and block numbers on your list automatically — no .vcf re-imports." />

<Faq {faqs} />
<p>Related: <a href="/report-spam-calls">report a number to the FTC and FCC</a> · <a href="/block-spam-calls">carrier and phone blocking guides</a> · <a href="/get-paid">get paid from illegal robocalls</a></p>
