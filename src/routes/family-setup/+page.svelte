<script lang="ts">
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import EmailCaptureBar from "#lib/components/EmailCaptureBar.svelte";
	import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, type Crumb } from "#lib/seo";
	import { PAID_CHECKED } from "#lib/content/paid-features";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const path = "/family-setup";
	const canonical = $derived(`${data.origin}${path}`);
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: path, label: "Family anti-scam setup kit" }
	];
	const title = "Protect a Parent From Scam Calls: Free 5-Minute Family Setup Kit (Printable)";
	const description =
		"Free printable, large-type setup guide to protect a parent or grandparent from spam and scam calls: built-in iPhone or Android call screening, the carrier’s free spam filter, a trusted-contacts list, and a family safe-word card against AI voice-clone scams.";

	type Phone = "ios26" | "ios18" | "pixel" | "samsung";
	type Carrier = "verizon" | "att" | "tmobile" | "other";
	let phone = $state<Phone>("ios26");
	let carrier = $state<Carrier>("verizon");
	let who = $state("");
	let helper = $state("");
	let helperPhone = $state("");

	const PHONES: Record<Phone, { label: string; steps: string[] }> = {
		ios26: {
			label: "iPhone (iOS 26)",
			steps: [
				"Open Settings → Apps → Phone → Screen Unknown Callers → choose Ask Reason for Calling. Unknown callers must say who they are before the phone rings. Contacts ring normally.",
				"In the same Phone settings, turn on Live Voicemail so messages show on screen as they are left.",
				"Messages: Settings → Apps → Messages → turn on screening or filtering for unknown senders, so texts from strangers go to a separate list (the exact name varies by iOS version)."
			]
		},
		ios18: {
			label: "iPhone (iOS 18)",
			steps: [
				"Open Settings → Apps → Phone → turn on Silence Unknown Callers. Numbers not in Contacts, recent outgoing calls, or Siri Suggestions go to voicemail without ringing.",
				"Turn on Live Voicemail in the same menu.",
				"If this iPhone can update to iOS 26, do it to get Ask Reason for Calling screening."
			]
		},
		pixel: {
			label: "Google Pixel / Google Phone app",
			steps: [
				"Open the Phone app → ⋮ → Settings → Spam and Call Screen.",
				"Turn on See caller & spam ID and Filter spam calls.",
				"Set up Call Screen so unknown numbers are screened automatically before the phone rings."
			]
		},
		samsung: {
			label: "Samsung Galaxy",
			steps: [
				"Open the Phone app → ⋮ → Settings → Caller ID and spam protection.",
				"Turn it on and choose to block high-risk spam calls.",
				"Menu names vary slightly by model and Android version."
			]
		}
	};

	const CARRIERS: Record<Carrier, { label: string; steps: string[]; url: string }> = {
		verizon: { label: "Verizon", steps: ["Open the Verizon Call Filter app (or My Verizon) and turn on spam filtering. Check the plan to see which features are free."], url: "https://www.verizon.com/support/call-filter-faqs/" },
		att: { label: "AT&T", steps: ["Install and open the AT&T ActiveArmor app and turn it on to block fraud calls and label suspected spam. Check the plan to see which features are free."], url: "https://www.att.com/support/article/wireless/000116671/" },
		tmobile: { label: "T-Mobile", steps: ["From the phone, dial #662# and press Call to turn on Scam Block (free). Dial #787# to check status. #632# turns it off."], url: "https://www.t-mobile.com/benefits/scam-shield" },
		other: { label: "Other carrier", steps: ["Look in the carrier’s app or website for its free spam or scam filter and turn it on. Cricket runs on AT&T’s network; Visible and Spectrum Mobile on Verizon’s."], url: "https://www.fcc.gov/call-blocking" }
	};

	const p = $derived(PHONES[phone]);
	const c = $derived(CARRIERS[carrier]);
	const name = $derived(who.trim() || "Mom/Dad");

	const steps = [
		{ name: "Turn on built-in call screening", text: "iPhone (iOS 26): Screen Unknown Callers → Ask Reason for Calling. Android: Spam and Call Screen or Caller ID and spam protection." },
		{ name: "Turn on the carrier’s free spam filter", text: "Verizon Call Filter, AT&T ActiveArmor, or T-Mobile Scam Shield (#662#)." },
		{ name: "Build the trusted-contacts list", text: "Save family, doctors, pharmacy, and the bank’s real number in Contacts so they always ring through screening." },
		{ name: "Pick a family safe word", text: "Agree on a secret word or phrase to confirm identity on any urgent call — the FBI recommends this against AI voice-clone scams." },
		{ name: "Print the card", text: "Print the one-page guide and put it next to the phone." }
	];
	const faqs = [
		{ q: "How do I stop scam calls to my elderly parent’s phone for free?", a: "Turn on the phone’s built-in screening (iPhone iOS 26: Settings → Apps → Phone → Screen Unknown Callers → Ask Reason for Calling; Android: Call Screen or Caller ID and spam protection), turn on the carrier’s free spam filter, save family and doctors in Contacts so they ring through, register the number at DoNotCall.gov, and agree on a family safe word. This kit prints all of it on one page." },
		{ q: "What is a family safe word?", a: "A secret word or phrase only your family knows, used to confirm it’s really you on an urgent call or text. The FBI’s December 2024 public service announcement on generative-AI fraud recommends creating one because scammers can clone a relative’s voice from short clips. If the caller can’t give the word, hang up and call the person back on a number you already know." },
		{ q: "Will call screening block calls from my parent’s doctor?", a: "Saved contacts ring normally. With iOS 26 Ask Reason for Calling, unknown callers like a new doctor’s office are asked who they are first, then the phone rings with their answer. Save important numbers in Contacts ahead of time." },
		{ q: "Is this the same as Aura or Truecaller family protection?", a: `It covers the do-it-yourself part. Aura includes AI spam call and message protection on its Family plan ($32/mo), and Truecaller Premium adds Advanced Family Protection. This free kit sets up the protection already built into the phone and carrier. Prices checked ${PAID_CHECKED}.` }
	];
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		webAppJsonLd({ origin: data.origin, path, name: "NoSpamCalls family & parent anti-scam setup kit", description }),
		howToJsonLd({ name: "How to protect a parent from scam calls in 5 minutes", description, steps }),
		faqJsonLd(faqs)
	]}
/>
<div class="no-print"><Breadcrumbs {crumbs} /></div>

<div class="no-print">
	<h1>Protect a parent from scam calls: free 5-minute family setup kit</h1>
	<div class="answer-box">
		<p class="answer-label">In short</p>
		<p>
			Pick your parent’s phone and carrier to get a large-type, one-page guide you can print: turn on the phone’s built-in call
			screening, the carrier’s free spam filter, a trusted-contacts list, and a family safe-word card against AI voice-clone
			calls (the FBI recommends a secret family word). Paid family plans like Aura’s charge for scam protection; this kit is free.
		</p>
	</div>

	<form class="tool-form tool-card" onsubmit={(e) => e.preventDefault()}>
		<div class="btn-row">
			<label><span>Their phone</span><select bind:value={phone}>{#each Object.entries(PHONES) as [id, ph]}<option value={id}>{ph.label}</option>{/each}</select></label>
			<label><span>Their carrier</span><select bind:value={carrier}>{#each Object.entries(CARRIERS) as [id, ca]}<option value={id}>{ca.label}</option>{/each}</select></label>
		</div>
		<div class="btn-row">
			<label><span>What they call you / their name (optional)</span><input type="text" bind:value={who} maxlength="30" placeholder="Mom" /></label>
			<label><span>Family helper name (optional)</span><input type="text" bind:value={helper} maxlength="40" placeholder="Jamie" /></label>
			<label><span>Helper phone (optional)</span><input type="tel" bind:value={helperPhone} maxlength="20" /></label>
		</div>
		<p class="muted">Stays in this browser only. Nothing here is sent to NoSpamCalls.</p>
		<button type="button" class="btn" onclick={() => window.print()}>Print the 1-page guide</button>
	</form>
</div>

<article class="family-sheet">
	<h2>{name}’s phone safety guide</h2>
	<p class="big">{p.label} · {c.label}</p>

	<h3>1. Let only known callers ring</h3>
	<ol>{#each p.steps as s}<li>{s}</li>{/each}</ol>

	<h3>2. Turn on the free spam filter ({c.label})</h3>
	<ol>{#each c.steps as s}<li>{s}</li>{/each}</ol>

	<h3>3. Trusted contacts — save these so they always ring</h3>
	<table class="fill-table">
		<tbody>
			<tr><td>Family helper</td><td>{helper || "________________"} {helperPhone || "________________"}</td></tr>
			<tr><td>Doctor</td><td>________________________________</td></tr>
			<tr><td>Pharmacy</td><td>________________________________</td></tr>
			<tr><td>Bank (number on the back of the card)</td><td>________________________________</td></tr>
			<tr><td>Other</td><td>________________________________</td></tr>
		</tbody>
	</table>

	<h3>4. Our family safe word</h3>
	<div class="safe-word">
		<p>If someone calls saying they’re family and need money or help <strong>right now</strong>, ask for our safe word.</p>
		<p class="big">Safe word: ______________________</p>
		<p class="muted">Write it by hand — don’t type it online. No word? Hang up and call them back on a number you know.</p>
	</div>

	<h3>5. Five rules for every call and text</h3>
	<ol>
		<li>Never give out a Social Security, Medicare, or bank number to someone who called you.</li>
		<li>Real government agencies and banks never ask to be paid with gift cards, crypto, or wire transfers.</li>
		<li>Hang up and call back on a number you already know — not one the caller gives you.</li>
		<li>Don’t tap links in texts about tolls, packages, or locked accounts. Ask {helper || "your family helper"} first.</li>
		<li>Pressure to act right now, or to keep it secret, is a scam sign. It’s OK to hang up.</li>
	</ol>
	<p class="muted">More free tools at nospamcalls.org · Do Not Call Registry: donotcall.gov · Report fraud: reportfraud.ftc.gov</p>
</article>

<div class="no-print">
	<section>
		<h2>Extra free layers</h2>
		<ul>
			<li><a href="https://www.donotcall.gov/" rel="noopener noreferrer">Register the number at DoNotCall.gov</a> (free; stops most legal telemarketing after 31 days).</li>
			<li>Add the free <a href="/blocklist">Top-100 spammer blocklist</a> as one blocked contact.</li>
			<li>Add the <a href="/voicemail-shield">“number disconnected” voicemail tone</a> to their greeting.</li>
			<li>Check where their phone and address are listed with the <a href="/exposure-check">free exposure check</a>.</li>
			<li>Got a suspicious text? Paste it into the <a href="/text-scam-check">scam text checker</a>.</li>
		</ul>
		<p class="muted">Sources: carrier steps from Verizon, AT&amp;T, and T-Mobile help pages (<a href={c.url} rel="noopener noreferrer">{c.label}</a>); safe-word advice from the FBI IC3 public service announcement I-120324-PSA (Dec. 3, 2024).</p>
	</section>

	<EmailCaptureBar
		headline="Get caregiver scam alerts — the scams targeting parents right now"
		sub="Weekly alerts, plus vote on Pro: family protection with caregiver alerts when a scam caller gets through. Free, unsubscribe anytime."
		leadMagnet="family_setup"
		button="Send me alerts"
	/>

	<Faq {faqs} />
	<p>Related: <a href="/setup">full phone &amp; carrier setup wizard</a> · <a href="/protect">free protection checkup</a> · <a href="/compare">paid apps compared</a></p>
</div>

<style>
	.family-sheet {
		border: 2px solid currentColor;
		border-radius: 12px;
		padding: 1.25rem 1.5rem;
		margin: 1.5rem 0;
		font-size: 1.15rem;
		line-height: 1.55;
	}
	.family-sheet h2 {
		margin-top: 0;
		font-size: 1.8rem;
	}
	.family-sheet h3 {
		font-size: 1.3rem;
		margin: 1rem 0 0.35rem;
	}
	.big {
		font-size: 1.3rem;
		font-weight: 700;
	}
	.fill-table {
		width: 100%;
		border-collapse: collapse;
	}
	.fill-table td {
		padding: 0.35rem 0.25rem;
		border-bottom: 1px solid #ccc;
	}
	.safe-word {
		border: 2px dashed currentColor;
		border-radius: 8px;
		padding: 0.5rem 1rem;
	}
	@media print {
		.family-sheet {
			border: none;
			padding: 0;
			margin: 0;
			font-size: 13.5pt;
			line-height: 1.4;
		}
		.family-sheet h2 {
			font-size: 20pt;
		}
		.family-sheet h3 {
			font-size: 15pt;
			margin-top: 0.6rem;
		}
	}
</style>
