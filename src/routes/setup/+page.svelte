<script lang="ts">
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, type Crumb } from "#lib/seo";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/setup", label: "Phone & carrier setup" }
	];
	const title = "Spam call setup wizard: iPhone, Android, Verizon, AT&T, T-Mobile";
	const description =
		"Pick your phone and carrier to get exact steps for built-in call screening, free carrier spam blocking, and conditional call forwarding codes (and how to turn them off).";
	const canonical = $derived(`${data.origin}/setup`);

	type Phone = "ios26" | "ios18" | "android";
	type Carrier = "verizon" | "att" | "tmobile" | "mvno";
	let phone = $state<Phone>("ios26");
	let carrier = $state<Carrier>("verizon");
	let fwd = $state("");
	const digits = $derived(fwd.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, ""));
	const n10 = $derived(digits.length === 10 ? digits : "NUMBER");

	const PHONES: Record<Phone, { label: string; steps: string[] }> = {
		ios26: {
			label: "iPhone (iOS 26)",
			steps: [
				"Settings → Apps → Phone → Screen Unknown Callers → choose Ask Reason for Calling. Unknown numbers are asked who they are before your phone rings; contacts ring normally.",
				"In the same Phone settings, keep Live Voicemail on so you can read voicemails as they are left.",
				"Settings → Apps → Phone → Call Blocking & Identification: turn on your carrier’s or a spam app’s extension if you use one.",
				"Import your NoSpamCalls .vcf blocklist and block the contact (see below)."
			]
		},
		ios18: {
			label: "iPhone (iOS 18)",
			steps: [
				"Settings → Apps → Phone → turn on Silence Unknown Callers. Calls from numbers not in Contacts, recent outgoing calls, or Siri Suggestions go to voicemail without ringing.",
				"Turn on Live Voicemail in the same menu.",
				"Settings → Apps → Phone → Call Blocking & Identification: enable any spam app extension you use.",
				"Update to iOS 26 if your iPhone supports it to get Ask Reason for Calling screening."
			]
		},
		android: {
			label: "Android",
			steps: [
				"Google Phone app (Pixel and many others): Phone → ⋮ → Settings → Spam and Call Screen → turn on See caller & spam ID and Filter spam calls, then set up Call Screen for unknown callers.",
				"Samsung Phone app: Phone → ⋮ → Settings → Caller ID and spam protection → turn it on and choose to block high-risk spam calls.",
				"Import your NoSpamCalls .vcf blocklist and block the contact (Contacts → open contact → ⋮ → Block numbers).",
				"Menu names vary slightly by phone maker and Android version."
			]
		}
	};

	const CARRIERS: Record<Carrier, { label: string; app: { name: string; url: string; note: string }; codes: { what: string; on: string; off: string }[]; codeNote: string }> = $derived({
		verizon: {
			label: "Verizon",
			app: { name: "Verizon Call Filter", url: "https://www.verizon.com/support/call-filter-faqs/", note: "Turn on spam filtering in the Call Filter app or in My Verizon. Check your plan for which features are free." },
			codes: [{ what: "Forward busy and unanswered calls", on: `*71${n10}`, off: "*73" }],
			codeNote: "From Verizon’s own support article. Dial from your Verizon phone and press Call."
		},
		att: {
			label: "AT&T",
			app: { name: "AT&T ActiveArmor", url: "https://www.att.com/support/article/wireless/000116671/", note: "Turn on ActiveArmor in the AT&T ActiveArmor app to block fraud calls and label suspected spam. Check your plan for which features are free." },
			codes: [
				{ what: "All three: busy, no answer, unreachable", on: `**004*${n10}#`, off: "##004#" },
				{ what: "No answer only", on: `**61*${n10}#`, off: "##61#" },
				{ what: "Busy only", on: `**67*${n10}#`, off: "##67#" },
				{ what: "Phone off / no signal", on: `**62*${n10}#`, off: "##62#" }
			],
			codeNote: "AT&T’s support pages point you to your phone’s Call Forwarding menu instead of printing codes. These are the standard GSM codes AT&T’s network uses; if one is rejected, use the menu or call 611."
		},
		tmobile: {
			label: "T-Mobile",
			app: { name: "T-Mobile Scam Shield", url: "https://www.t-mobile.com/benefits/scam-shield", note: "Free. Dial #662# to turn on Scam Block, #632# to turn it off, #664# for Scam ID, and #787# to check status." },
			codes: [
				{ what: "No answer", on: `**61*1${n10}#`, off: "##61#" },
				{ what: "Busy", on: `**67*1${n10}#`, off: "##67#" },
				{ what: "Phone off / no signal", on: `**62*1${n10}#`, off: "##62#" },
				{ what: "Reset all forwarding to default", on: "—", off: "##004#" }
			],
			codeNote: "From T-Mobile’s official short-codes page. Note the 1 before the 10-digit number."
		},
		mvno: {
			label: "Cricket / Visible / Spectrum / other",
			app: { name: "Your carrier’s spam app", url: "https://www.fcc.gov/call-blocking", note: "Cricket runs on AT&T’s network, Visible and Spectrum Mobile on Verizon’s. Check your carrier’s app or website for its free spam filter. The FCC keeps a guide to call-blocking resources." },
			codes: [
				{ what: "GSM-style networks (e.g., Cricket): all conditional", on: `**004*${n10}#`, off: "##004#" },
				{ what: "Verizon-network carriers (try first)", on: `*71${n10}`, off: "*73" }
			],
			codeNote: "Some prepaid and budget plans do not support conditional call forwarding. If a code fails, use your phone’s Call Forwarding menu or ask your carrier."
		}
	});

	const steps = [
		{ name: "Turn on built-in screening", text: "On iPhone (iOS 26) use Screen Unknown Callers → Ask Reason for Calling; on Android turn on Call Screen and spam filtering." },
		{ name: "Turn on your carrier’s free spam filter", text: "Verizon Call Filter, AT&T ActiveArmor, or T-Mobile Scam Shield." },
		{ name: "Block your personal list", text: "Download the NoSpamCalls .vcf blocklist, import it, and block the contact." },
		{ name: "Optional: conditional call forwarding", text: "Forward busy, unanswered, or unreachable calls to a screening or voicemail number you trust, using your carrier’s codes. Dial the off code to undo." }
	];
	const faqs = [
		{ q: "What is conditional call forwarding?", a: "It sends only the calls you don’t answer, decline, or can’t receive to another number, such as a voicemail or call-screening service. Your phone still rings first. Apps like YouMail and RoboKiller use it to answer spam calls for you." },
		{ q: "How do I turn off call forwarding?", a: "Verizon: dial *73. AT&T and other GSM networks: dial ##004#. T-Mobile: dial ##004# to reset to default. You can also switch it off in your phone’s Call Forwarding settings." },
		{ q: "Does iPhone have built-in spam call screening?", a: "Yes. On iOS 26, Settings → Apps → Phone → Screen Unknown Callers → Ask Reason for Calling asks unknown callers for their name and reason before your phone rings. On iOS 18, Silence Unknown Callers sends them straight to voicemail." },
		{ q: "Is my carrier’s spam blocking free?", a: "Verizon Call Filter, AT&T ActiveArmor, and T-Mobile Scam Shield each offer free spam protection on many plans, with paid upgrades for extras like caller name ID. Check your own plan in the carrier app." }
	];
	const c = $derived(CARRIERS[carrier]);
	const p = $derived(PHONES[phone]);
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		webAppJsonLd({ origin: data.origin, path: "/setup", name: "NoSpamCalls phone & carrier setup wizard", description }),
		howToJsonLd({ name: "How to set up spam call blocking on your phone and carrier", description, steps }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<h1>Phone &amp; carrier spam setup wizard</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		The strongest free setup is three layers: your phone’s built-in screening (Ask Reason for Calling on iOS 26, Call Screen on
		Android), your carrier’s free spam filter, and your personal NoSpamCalls blocklist. Conditional call forwarding codes are
		below for when you want a screening service to answer missed calls.
	</p>
</div>

<div class="tool-card">
	<p><strong>Your phone</strong></p>
	<div class="tabs">
		{#each Object.entries(PHONES) as [id, ph]}
			<button type="button" class="btn small secondary" aria-pressed={phone === id} onclick={() => (phone = id as Phone)}>{ph.label}</button>
		{/each}
	</div>
	<p><strong>Your carrier</strong></p>
	<div class="tabs">
		{#each Object.entries(CARRIERS) as [id, ca]}
			<button type="button" class="btn small secondary" aria-pressed={carrier === id} onclick={() => (carrier = id as Carrier)}>{ca.label}</button>
		{/each}
	</div>
</div>

<div class="hero-grid">
	<section class="tool-card">
		<h2>1. {p.label}: built-in screening</h2>
		<ol class="step-list">{#each p.steps as s}<li>{s}</li>{/each}</ol>
	</section>
	<section class="tool-card">
		<h2>2. {c.label}: free spam filter</h2>
		<p><a href={c.app.url} rel="noopener noreferrer" target="_blank"><strong>{c.app.name}</strong></a></p>
		<p>{c.app.note}</p>
	</section>
</div>

<section class="tool-card">
	<h2>3. Your blocklist</h2>
	<p>Add every number that slips through on <a href="/blocklist">Block a Number</a>, download the .vcf, import it, and block the “NoSpamCalls Blocklist” contact.</p>
	<p><a class="btn" href="/blocklist">Open my blocklist</a></p>
</section>

<section class="tool-card">
	<h2>4. {c.label}: conditional call forwarding codes</h2>
	<form class="tool-form" onsubmit={(e) => e.preventDefault()} style="max-width: 26rem">
		<label><span>Forward missed calls to (10-digit number you trust)</span><input type="tel" bind:value={fwd} placeholder="Screening or voicemail number" /></label>
	</form>
	<div class="table-wrap">
		<table class="data-table">
			<thead><tr><th>What</th><th>Turn on (dial)</th><th>Turn off (dial)</th></tr></thead>
			<tbody>
				{#each c.codes as code}
					<tr><td>{code.what}</td><td><span class="code">{code.on}</span></td><td><span class="code">{code.off}</span></td></tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="muted">{c.codeNote}</p>
	<p class="legal-note">
		Only forward to a number you control or a service you trust — whoever owns that number receives your missed calls. NoSpamCalls
		live call screening (planned for <a href="/app#pro">NoSpamCalls Pro</a>) will give you a screening number to use here when it launches; until then you don’t
		need to forward anything.
	</p>
</section>

<Faq {faqs} />
<p>Related guides: <a href="/block-spam-calls/iphone">iPhone</a> · <a href="/block-spam-calls/android">Android</a> · <a href="/block-spam-calls/verizon">Verizon</a> · <a href="/block-spam-calls/att">AT&amp;T</a> · <a href="/block-spam-calls/t-mobile">T-Mobile</a> · <a href="/stop-spam-calls">Do Not Call guide</a></p>
