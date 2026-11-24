<script lang="ts">
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import EmailCaptureBar from "#lib/components/EmailCaptureBar.svelte";
	import { postJson } from "#lib/account";
	import { formatNational, e164ToSlug } from "#lib/phone";
	import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, type Crumb } from "#lib/seo";
	import { PAID_CHECKED } from "#lib/content/paid-features";
	import type { PageProps } from "./$types";

	type Flag = { level: "high" | "medium" | "info"; text: string };
	type Link = { url: string; host: string; domain: string; registeredAt: string | null; ageDays: number | null; registrar: string | null; resolves: boolean | null; officialFor: string | null; flags: Flag[] };
	type Phone = { e164: string; govCount: number; topSubject: string | null; lastReportedAt: string | null };
	type Scan = { verdict: "likely_scam" | "suspicious" | "no_red_flags"; score: number; flags: Flag[]; links: Link[]; phones: Phone[]; brands: string[]; nextSteps: string[] };

	let { data }: PageProps = $props();
	const path = "/text-scam-check";
	const canonical = $derived(`${data.origin}${path}`);
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: path, label: "Scam text checker" }
	];
	const title = "Is This Text a Scam? Free Scam Text & Link Checker";
	const description =
		"Paste a suspicious text message to check it free: real domain age (RDAP), look-alike and fake USPS, toll, IRS, bank and Amazon links, link shorteners, scam phrases, and FTC/FCC complaints for any phone number in it. Nothing is stored.";

	const SAMPLES = [
		{ label: "Fake toll text", sender: "+44 7700 900123", message: "Toll Services: You have an unpaid toll balance of $6.99. Pay within 24 hours to avoid a late fee: https://ezpass-tollservice.top/pay Reply Y then reopen this message to activate the link." },
		{ label: "Fake USPS text", sender: "usps.alerts@icloud-mail.com", message: "USPS: Your package could not be delivered due to an incomplete address. Update your address within 12 hours: usps-redelivery.info/track" },
		{ label: "Real-looking bank alert", sender: "", message: "Chase: A card purchase of $412.00 needs review. Open the Chase app or sign in at chase.com to confirm." }
	];

	let message = $state("");
	let sender = $state("");
	let busy = $state(false);
	let error = $state("");
	let result = $state<Scan | null>(null);

	async function check(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		error = "";
		result = null;
		try {
			const res = await postJson<{ result: Scan }>("/api/text-scan", { message, sender });
			result = res.result;
		} catch (err) {
			error = (err as Error).message;
		} finally {
			busy = false;
		}
	}
	function useSample(s: (typeof SAMPLES)[number]) {
		message = s.message;
		sender = s.sender;
		result = null;
	}

	const VERDICT = {
		likely_scam: { pill: "high", label: "Likely scam", text: "This message has strong scam warning signs. Don’t tap the link, reply, or call numbers in it." },
		suspicious: { pill: "", label: "Suspicious", text: "Some warning signs. Verify with the company directly using an app or number you already trust." },
		no_red_flags: { pill: "ok", label: "No red flags found", text: "We didn’t find common scam signs — that is not a guarantee it’s safe. If you didn’t expect it, verify first." }
	} as const;

	const steps = [
		{ name: "Paste the text", text: "Copy the full text message (and the sender number or email, if you want) into the checker. Don’t tap the link first." },
		{ name: "Read the red flags", text: "We check each link’s registered domain and its age with public RDAP, look-alike and brand-impersonation domains, link shorteners, scam phrases, and FTC/FCC complaints for any phone number." },
		{ name: "Block and report", text: "Forward the text to 7726 (SPAM), block the sender, report it at ReportFraud.ftc.gov, and add any phone number to your free NoSpamCalls blocklist." }
	];
	const faqs = [
		{ q: "How can I tell if a text message is a scam?", a: "Common signs: a link to a domain the company doesn’t use, a brand-new domain, a link shortener, pressure to pay or act within hours, an unpaid toll or failed package delivery you didn’t expect, a request to reply “Y,” or a request for a verification code, gift cards, or crypto. Paste the text into this free checker to see which signs it has." },
		{ q: "Is it safe to paste a scam text here?", a: "Yes. The message is analyzed in memory and is never stored or logged. We never open the link. We only ask public registration (RDAP) and DNS records about the domain, and look up any phone number in FTC/FCC complaint data." },
		{ q: "What does domain age tell me?", a: "Scam texts usually point to domains registered days or weeks earlier, because old ones get blocked fast. A domain registered in the last 30 days that claims to be USPS, a toll agency, or a bank is a strong warning sign. An old domain is not proof of safety." },
		{ q: "Should I reply STOP to a scam text?", a: "No. Replying to an unknown sender confirms your number is active. Forward the text to 7726 (SPAM) so your carrier can act on it, then block the sender and delete it. Reply STOP only to companies you knowingly signed up with." },
		{ q: "Do I need a paid app to filter scam texts?", a: `Paid apps such as RoboKiller, Truecaller, and Aura filter texts automatically on your phone. This free checker gives you the same kind of link and sender analysis on demand. Your phone also has free filtering: iPhone Messages can filter unknown senders, and Google Messages has built-in spam protection. Facts checked ${PAID_CHECKED}.` }
	];
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		webAppJsonLd({ origin: data.origin, path, name: "NoSpamCalls scam text & link checker", description }),
		howToJsonLd({ name: "How to check if a text message is a scam", description, steps }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<h1>Is this text a scam? Free scam text &amp; link checker</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		Paste the text below. We pull out every link and phone number, check each link’s real domain and how many days ago it was
		registered (public RDAP), flag look-alike and fake USPS, toll, IRS, bank, and Amazon domains and link shorteners, spot
		common scam phrases, and look up phone numbers in FTC/FCC complaints. The message is never stored, and we never open the
		link. Paid apps like RoboKiller, Truecaller, and Aura charge for text-scam filtering — this check is free.
	</p>
</div>

<section class="hero-grid">
	<form class="tool-form tool-card" onsubmit={check}>
		<label>
			<span>Text message</span>
			<textarea bind:value={message} rows="7" required maxlength="5000" placeholder="Paste the full text message here"></textarea>
		</label>
		<label>
			<span>Sender number or email (optional)</span>
			<input type="text" bind:value={sender} maxlength="120" placeholder="+1 555… or name@example.com" autocomplete="off" />
		</label>
		<button class="btn" type="submit" disabled={busy}>{busy ? "Checking…" : "Check this text"}</button>
		<p class="muted">Try a sample:
			{#each SAMPLES as s, i}{#if i} · {/if}<button type="button" class="text-button" onclick={() => useSample(s)}>{s.label}</button>{/each}
		</p>
		<p class="muted">Analyzed in memory only — never stored. We never open the link.</p>
		{#if error}<p class="form-error" role="alert">{error}</p>{/if}
	</form>

	<div class="tool-card" aria-live="polite">
		<h2>Result</h2>
		{#if result}
			{@const v = VERDICT[result.verdict]}
			<p><span class={`pill ${v.pill}`}>{v.label}</span> <span class="muted">Risk score {result.score}/100</span></p>
			<p>{v.text}</p>
			{#if result.flags.length}
				<h3>Message red flags</h3>
				<ul class="flag-list">{#each result.flags as f}<li class={f.level}>{f.text}</li>{/each}</ul>
			{/if}
			{#each result.links as l}
				<h3>Link: <span class="code">{l.host}</span></h3>
				<table class="data-table">
					<tbody>
						<tr><th>Registered domain</th><td>{l.domain}{l.officialFor ? ` (official: ${l.officialFor})` : ""}</td></tr>
						<tr><th>Registered on</th><td>{l.registeredAt ? `${l.registeredAt.slice(0, 10)} (${l.ageDays} days ago)` : "Not available"}</td></tr>
						{#if l.registrar}<tr><th>Registrar</th><td>{l.registrar}</td></tr>{/if}
						<tr><th>Resolves in DNS</th><td>{l.resolves === null ? "Unknown" : l.resolves ? "Yes" : "No"}</td></tr>
					</tbody>
				</table>
				{#if l.flags.length}<ul class="flag-list">{#each l.flags as f}<li class={f.level}>{f.text}</li>{/each}</ul>{/if}
			{/each}
			{#if result.phones.length}
				<h3>Phone numbers in the text</h3>
				<ul>
					{#each result.phones as p}
						<li>
							<a href={`/number/${e164ToSlug(p.e164)}`}>{formatNational(p.e164)}</a> —
							{p.govCount ? `${p.govCount} FTC/FCC complaint${p.govCount === 1 ? "" : "s"}${p.topSubject ? ` · ${p.topSubject}` : ""}` : "no FTC/FCC complaints in our data (that doesn’t make it safe)"}
							· <a href={`/blocklist?number=${encodeURIComponent(p.e164)}`}>Add to my blocklist</a>
							· <a href={`/report?number=${encodeURIComponent(p.e164)}`}>Report it</a>
						</li>
					{/each}
				</ul>
			{/if}
			<h3>What to do now</h3>
			<ol class="step-list">{#each result.nextSteps as s}<li>{s}</li>{/each}</ol>
			<div class="btn-row">
				<a class="btn small secondary" href="https://reportfraud.ftc.gov/" rel="noopener noreferrer">Report to the FTC</a>
				<a class="btn small secondary" href="/blocklist">Open my blocklist</a>
			</div>
		{:else}
			<p class="muted">Your result appears here: a verdict, every red flag we found, each link’s domain age, and what to do next.</p>
		{/if}
	</div>
</section>

<EmailCaptureBar
	headline="Get weekly scam-text alerts — the new toll, package, and bank text scams going around"
	sub="Plus vote on Pro: automatic text filtering on your phone. Free, unsubscribe anytime."
	leadMagnet="text_scam_check"
	button="Send me alerts"
	unlockedText="You’ll get the weekly scam alerts."
/>

<section>
	<h2>The scam texts we check for</h2>
	<div class="tool-grid">
		<div class="tool-card"><h3>Unpaid toll texts</h3><p>“Unpaid toll balance, pay within 24 hours.” Toll agencies’ real sites are on their own domains; scam links use new look-alike domains.</p></div>
		<div class="tool-card"><h3>Fake USPS / package texts</h3><p>USPS says it won’t text tracking updates unless you requested them with a tracking number, and those texts won’t contain a link.</p></div>
		<div class="tool-card"><h3>Bank, Apple &amp; Amazon “account locked”</h3><p>Look-alike domains and “verify your account” links that steal logins and one-time codes.</p></div>
		<div class="tool-card"><h3>IRS, refund &amp; DMV threats</h3><p>The IRS says it does not start contact by text to ask for personal or financial information.</p></div>
		<div class="tool-card"><h3>“Wrong number” &amp; job texts</h3><p>Friendly openers that lead to crypto “investment” and task-job scams.</p></div>
		<div class="tool-card"><h3>Reply-“Y” tricks</h3><p>Asking you to reply so your phone treats the sender as known — and enables the blocked link.</p></div>
	</div>
</section>

<Faq {faqs} />
<p>Related: <a href="/scams">phone &amp; text scam guides</a> · <a href="/email-shield">email spam shield</a> · <a href="/blocklist">free blocklist</a> · <a href="/compare">paid apps compared</a></p>
