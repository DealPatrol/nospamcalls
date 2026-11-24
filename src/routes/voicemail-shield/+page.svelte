<script lang="ts">
	import { onDestroy } from "svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import EmailCaptureBar from "#lib/components/EmailCaptureBar.svelte";
	import { buildSitWav, SIT_CODES, type SitCode } from "#lib/sit-tone";
	import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, type Crumb } from "#lib/seo";
	import { PAID_CHECKED } from "#lib/content/paid-features";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const path = "/voicemail-shield";
	const canonical = $derived(`${data.origin}${path}`);
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: path, label: "Voicemail shield (SIT tone)" }
	];
	const title = "Free “Number Disconnected” Tone (SIT) & Anti-Spam Voicemail Greeting";
	const description =
		"Download the real three-tone “not in service” SIT tone as a free WAV, add it to your voicemail greeting in 60 seconds with iPhone, Verizon, AT&T, or T-Mobile steps, and use ready-to-read anti-robocall greeting scripts.";

	let code = $state<SitCode>("IC");
	let repeats = $state(1);
	let audioUrl = $state("");
	let lastUrl = ""; // not reactive, so the effect doesn’t re-run on its own write
	let name = $state("");
	let script = $state<"opener" | "screener" | "family" | "full">("opener");

	$effect(() => {
		if (typeof window === "undefined") return;
		const bytes = buildSitWav(code, { repeats, tailMs: 500 });
		const url = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
		if (lastUrl) URL.revokeObjectURL(lastUrl);
		lastUrl = url;
		audioUrl = url;
	});
	onDestroy(() => {
		if (lastUrl) URL.revokeObjectURL(lastUrl);
	});

	const who = $derived(name.trim() || "[your first name]");
	const SCRIPTS = $derived({
		opener: {
			label: "Tone + friendly greeting (recommended)",
			text: `[Play the tones] … [pause 1 second] Hi, you’ve reached ${who}. If you know me, leave your name and number, or just text me, and I’ll get back to you.`
		},
		screener: {
			label: "Tone + call-screener greeting",
			text: `[Play the tones] … [pause 1 second] You’ve reached ${who}. I don’t answer unknown numbers. Please say your name, who you’re with, and why you’re calling. Sales and survey calls: please remove this number from your list.`
		},
		family: {
			label: "Tone + senior / family protection greeting",
			text: `[Play the tones] … [pause 1 second] You’ve reached ${who}. My family helps me with my calls. I never give out bank, Medicare, or Social Security information over the phone. If you’re family or my doctor’s office, please leave a message or text me and someone will call you back.`
		},
		full: {
			label: "Tone + “not in service” (strongest, confuses real callers)",
			text: `[Play the tones] … [pause 1 second] The number you have reached is not accepting calls. [pause 2 seconds] Friends and family: text ${who} instead.`
		}
	});

	const steps = [
		{ name: "Pick and play the tone", text: "Choose the Intercept (IC) tone — the classic “not in service” tones — and press play to check it, or download the WAV." },
		{ name: "Open your greeting recorder", text: "iPhone: Phone → Voicemail → Greeting → Custom → Record. Verizon: dial *86, then Personal Options → Greetings. AT&T: press and hold 1, then 4, 3, 1. T-Mobile: press and hold 1, then 3, 2." },
		{ name: "Record the tone, then your script", text: "Start recording, play the tone from a computer or second phone held a few inches from your phone’s microphone, then read your greeting script. Stop, play it back, and save." },
		{ name: "Tell your contacts", text: "Let friends, family, and your doctor’s office know to leave a message or text you if they hear the tones." }
	];
	const faqs = [
		{ q: "What is a SIT tone?", a: "Special Information Tones are the three rising beeps you hear before “the number you have dialed is not in service.” Under the ATIS network tones standard (ATIS-0300209) they are three precise tones — 913.8 or 985.2 Hz, then 1370.6 or 1428.5 Hz, then 1776.7 Hz, each 274 or 380 milliseconds — that let automated call-analysis systems classify a failed call. The Intercept code (913.8 Hz 274 ms, 1370.6 Hz 274 ms, 1776.7 Hz 380 ms) means the number was changed or disconnected." },
		{ q: "Does a disconnected tone on my voicemail stop robocalls?", a: "It can help, but no one can promise it. Autodialers use call-progress analysis to recognize SIT tones, and some log the number as not working when they hear the tones at the start of your greeting. It only plays when a call reaches your voicemail, and it won’t stop live callers, spoofed calls, or scammers who don’t use that detection. Use it together with your phone’s built-in call screening and your carrier’s free spam filter." },
		{ q: "Will my friends think my number is disconnected?", a: "They might at first. That’s why the recommended greeting plays the tones and then your normal greeting. Tell people who call you to leave a message or text you if they hear the tones. The “not in service” script is the strongest and the most confusing for real callers." },
		{ q: "How do I put the tone in my iPhone voicemail greeting?", a: "Open Phone → Voicemail → Greeting → Custom → Record. Play the downloaded WAV from a computer or another phone near your iPhone’s microphone, then say your greeting, tap Stop, then Save. Apple notes custom greetings may not be available with every carrier; if not, record it through your carrier’s voicemail menu instead." },
		{ q: "Is this the same as YouMail or RoboKiller?", a: `It’s the do-it-yourself version. YouMail’s Ghosting plays an “out of service” message to blocked callers (auto-ghosting known spammers is for paid users), and RoboKiller’s “Number Disconnected” Answer Bot needs Premium+ and call forwarding. Your greeting plays to every caller who reaches voicemail, not only spammers. Facts checked ${PAID_CHECKED}.` }
	];
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		webAppJsonLd({ origin: data.origin, path, name: "NoSpamCalls SIT tone & voicemail shield generator", description, category: "UtilitiesApplication" }),
		howToJsonLd({ name: "How to add a “number disconnected” tone to your voicemail greeting", description, steps }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<h1>Free “number disconnected” tone &amp; anti-spam voicemail greeting</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		Play or download the real North American “not in service” SIT tone (Intercept: 913.8 Hz, 1370.6 Hz, 1776.7 Hz) as a free
		WAV, record it at the start of your voicemail greeting, then read one of the scripts below. Autodialers are built to
		recognize these tones, so some will treat your number as dead. Paid apps like YouMail and RoboKiller sell this as a
		feature; here it’s free and generated right in your browser.
	</p>
</div>

<section class="hero-grid">
	<div class="tool-card tool-form">
		<h2>1. Your SIT tone</h2>
		<label>
			<span>Tone code</span>
			<select bind:value={code}>
				{#each Object.entries(SIT_CODES) as [id, c]}<option value={id}>{c.label} — {c.meaning}</option>{/each}
			</select>
		</label>
		<label>
			<span>Play the tones</span>
			<select bind:value={repeats}>
				<option value={1}>Once (best for a greeting)</option>
				<option value={2}>Twice</option>
				<option value={3}>Three times</option>
			</select>
		</label>
		{#if audioUrl}
			<audio controls src={audioUrl} preload="auto"></audio>
		{:else}
			<p class="muted">Loading the player…</p>
		{/if}
		<div class="btn-row">
			<a class="btn" href={`/api/sit-tone.wav?code=${code}&repeats=${repeats}`} download>Download WAV</a>
		</div>
		<table class="data-table">
			<thead><tr><th>Segment</th><th>Frequency</th><th>Length</th></tr></thead>
			<tbody>
				{#each SIT_CODES[code].segments as [f, d], i}<tr><td>{i + 1}</td><td>{f} Hz</td><td>{d} ms</td></tr>{/each}
			</tbody>
		</table>
		<p class="muted">16-bit, 16 kHz mono WAV. Values from the ATIS-0300209 network tones standard and Bellcore BR 780-200-020.</p>
	</div>

	<div class="tool-card tool-form">
		<h2>2. Your greeting script</h2>
		<label><span>Your first name (optional, stays in your browser)</span><input type="text" bind:value={name} maxlength="40" placeholder="Pat" /></label>
		<label>
			<span>Script</span>
			<select bind:value={script}>
				{#each Object.entries(SCRIPTS) as [id, s]}<option value={id}>{s.label}</option>{/each}
			</select>
		</label>
		<blockquote class="notice"><p>{SCRIPTS[script].text}</p></blockquote>
		{#if script === "full"}<p class="form-error">Real callers will hear “not accepting calls.” Tell family and important contacts to text you.</p>{/if}
	</div>
</section>

<section>
	<h2>3. Put it on your voicemail in 60 seconds</h2>
	<p>Start recording, play the tone from a computer or a second phone held a few inches from your phone’s microphone, pause one second, read your script, then stop and save.</p>
	<div class="table-wrap">
		<table class="data-table">
			<thead><tr><th>Phone / carrier</th><th>Steps</th><th>Source</th></tr></thead>
			<tbody>
				<tr><td><strong>iPhone</strong> (visual voicemail)</td><td>Phone → Voicemail → Greeting → Custom → Record → Stop → Play → Save. If Custom isn’t offered, use your carrier’s menu below.</td><td><a href="https://support.apple.com/guide/iphone/change-voicemail-greeting-and-settings-ipha113f4a15/ios" rel="noopener noreferrer">Apple Support</a></td></tr>
				<tr><td><strong>Verizon</strong></td><td>Dial <span class="code">*86</span>, enter your PIN, press <span class="code">4</span> (Personal Options), <span class="code">3</span> (Greetings), <span class="code">1</span> (Personal greeting), record, press <span class="code">#</span>. Menus can differ on some voicemail platforms — follow the prompts.</td><td><a href="https://www.verizon.com/support/pdf/VM_2.pdf" rel="noopener noreferrer">Verizon voicemail guide</a></td></tr>
				<tr><td><strong>AT&amp;T</strong></td><td>Press and hold <span class="code">1</span>, enter your password, press <span class="code">4</span> (Personal options), <span class="code">3</span> (Greeting), <span class="code">1</span> (Personal greeting).</td><td><a href="https://www.att.com/scmsassets/support/other/at&t-voicemail-menu.pdf" rel="noopener noreferrer">AT&amp;T voicemail menu</a></td></tr>
				<tr><td><strong>T-Mobile</strong></td><td>Press and hold <span class="code">1</span> (or open Visual Voicemail), press <span class="code">3</span> (Create a greeting), <span class="code">2</span> (Record greeting).</td><td><a href="https://www.t-mobile.com/support/plans-features/voicemail" rel="noopener noreferrer">T-Mobile Support</a></td></tr>
				<tr><td><strong>Android / other carriers</strong></td><td>Open your carrier’s voicemail app → Settings → Greeting, or call your voicemail (press and hold 1) and choose the greeting option.</td><td>Your carrier’s voicemail help page</td></tr>
			</tbody>
		</table>
	</div>
</section>

<section class="notice">
	<h2>Honest note: what the tone can and can’t do</h2>
	<ul>
		<li>SIT tones exist so machines can classify failed calls — the ATIS standard says they “enable automated call detection and analysis systems to classify ineffective call attempts.” Many predictive dialers listen for them.</li>
		<li>The tone only plays when a call reaches your voicemail. It doesn’t stop live agents, spoofed caller IDs, or dialers that ignore SIT detection, and no tool can guarantee your number gets removed from lists.</li>
		<li>Best results: combine it with free call screening (iPhone Screen Unknown Callers, Android Call Screen) and your carrier’s free spam filter — see the <a href="/setup">setup wizard</a>.</li>
		<li>Tell people who call you that the tones are on purpose and to leave a message or text.</li>
	</ul>
</section>

<EmailCaptureBar
	headline="Get the free voicemail shield checklist + weekly scam-call alerts"
	sub="Plus vote on Pro: automatic screening that ghosts known spammers for you. Free, unsubscribe anytime."
	leadMagnet="voicemail_shield"
	button="Send it free"
/>

<Faq {faqs} />
<p>Related: <a href="/setup">phone &amp; carrier setup</a> · <a href="/neighbor-spoof">neighbor-spoof blocker</a> · <a href="/blocklist">free blocklist</a> · <a href="/compare">paid apps compared</a></p>
