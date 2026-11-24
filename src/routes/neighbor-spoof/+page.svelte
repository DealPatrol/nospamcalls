<script lang="ts">
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import EmailCaptureBar from "#lib/components/EmailCaptureBar.svelte";
	import { formatNational, e164ToSlug } from "#lib/phone";
	import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, type Crumb } from "#lib/seo";
	import { PAID_CHECKED } from "#lib/content/paid-features";
	import type { PageProps } from "./$types";

	type N = { e164: string; total_gov_count: number; top_subject: string | null; last_reported_at: string | null };
	type R = { npa: string; nxx: string | null; inService: boolean; prefixNumbers: N[]; prefixTotal: number; areaNumbers: N[]; areaTotal: number; areaComplaints: number };

	let { data }: PageProps = $props();
	const path = "/neighbor-spoof";
	const canonical = $derived(`${data.origin}${path}`);
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: path, label: "Neighbor-spoof blocker" }
	];
	const title = "Neighbor Spoofing Blocker: Block Spam Calls That Look Like Your Number";
	const description =
		"Free neighbor-spoof blocker: enter your area code and prefix to see real FTC/FCC-reported spam numbers that look like yours, then download one blockable contact card for iPhone or Android — a feature paid apps like Hiya Premium and Truecaller Premium charge for.";

	let mine = $state("");
	let npa = $state("");
	let nxx = $state("");
	let busy = $state(false);
	let error = $state("");
	let result = $state<R | null>(null);
	let scope = $state<"area" | "prefix">("area");
	let useRange = $state(false);
	let from = $state("0000");
	let to = $state("0999");

	function fromMine() {
		const d = mine.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
		if (d.length >= 6) {
			npa = d.slice(0, 3);
			nxx = d.slice(3, 6);
		}
	}

	async function lookup(event: SubmitEvent) {
		event.preventDefault();
		fromMine();
		busy = true;
		error = "";
		result = null;
		try {
			const qs = new URLSearchParams({ npa });
			if (nxx) qs.set("nxx", nxx);
			const res = await fetch(`/api/prefix-spam?${qs}`);
			const body = await res.json();
			if (!res.ok) throw new Error(body.error || "Lookup failed.");
			result = body.result as R;
			scope = result.prefixTotal >= 3 ? "prefix" : "area";
		} catch (err) {
			error = (err as Error).message;
		} finally {
			busy = false;
		}
	}

	const rangeOk = $derived(/^\d{4}$/.test(from) && /^\d{4}$/.test(to) && Number(to) >= Number(from));
	const rangeCount = $derived(rangeOk ? Math.min(Number(to) - Number(from) + 1, 1000) : 0);
	const vcfHref = $derived(
		result
			? `/api/prefix-blocklist.vcf?${new URLSearchParams({
					npa: result.npa,
					...(result.nxx ? { nxx: result.nxx } : {}),
					scope,
					...(useRange && result.nxx && rangeOk ? { from, to } : {})
				})}`
			: ""
	);
	const vcfCount = $derived(
		result ? (scope === "prefix" ? result.prefixNumbers.length : new Set([...result.prefixNumbers, ...result.areaNumbers].map((n) => n.e164)).size) + (useRange && result.nxx ? rangeCount : 0) : 0
	);

	const steps = [
		{ name: "Enter your area code and prefix", text: "Type your own number (or just its first six digits). Neighbor-spoof calls copy your area code and often your 3-digit prefix." },
		{ name: "Review real reported look-alikes", text: "See numbers with your area code and prefix that appear in FTC and FCC complaints." },
		{ name: "Download one contact card", text: "Download a single .vcf contact holding those numbers (plus an optional custom range), import it, and block that contact." },
		{ name: "Turn on free screening", text: "Turn on iPhone Screen Unknown Callers or Android Call Screen so the rest of the neighbor spoofs never ring." }
	];
	const faqs = [
		{ q: "What is neighbor spoofing?", a: "Neighbor spoofing is when a robocaller fakes the caller ID so the call appears to come from a local number — often your own area code and first three digits — because people are more likely to answer. The FCC describes it in its caller ID spoofing guide." },
		{ q: "Can I block a whole prefix on iPhone?", a: "Not with iPhone’s built-in blocking, which blocks one number or contact at a time. The workaround is one contact card that holds many numbers: import it and block the contact. Paid apps like Hiya (Premium $3.99/mo, up to 25 area-code/prefix combinations) and Truecaller Premium (“Number Series,” up to 5) add wildcard prefix blocking." },
		{ q: "Should I block my entire prefix?", a: "Be careful. Your prefix also belongs to real neighbors, local businesses, schools, and doctors’ offices. Start with the reported numbers. Only add a custom range if spoofed calls keep coming, and turn on Screen Unknown Callers or Call Screen so legitimate unknown callers can still reach you." },
		{ q: "Where do these numbers come from?", a: "From FCC Consumer Complaints (unwanted calls) and the FTC Do Not Call Reported Calls data, refreshed daily. Caller ID can be spoofed, so a reported number may belong to an innocent person whose number was faked." },
		{ q: "Do I need a paid app to stop neighbor spoofing?", a: `No. Free layers work well together: your carrier’s free spam filter, iPhone Screen Unknown Callers or Android Call Screen, and this prefix contact card. Hiya’s free tier only warns on prefix matches; blocking them is Premium. Facts checked ${PAID_CHECKED}.` }
	];
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		webAppJsonLd({ origin: data.origin, path, name: "NoSpamCalls neighbor-spoof prefix blocker", description }),
		howToJsonLd({ name: "How to block neighbor-spoofed spam calls", description, steps }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<h1>Neighbor-spoof blocker: stop spam calls that look like your number</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		Spam calls that share your area code and first three digits are “neighbor spoofing.” Enter your number below to see real
		FTC/FCC-reported numbers with your area code and prefix, then download one contact card that blocks them all at once on
		iPhone or Android. Hiya and Truecaller charge for prefix blocking; this is free.
	</p>
</div>

<section class="hero-grid">
	<form class="tool-form tool-card" onsubmit={lookup}>
		<label>
			<span>Your phone number (only the first 6 digits are used)</span>
			<input type="tel" bind:value={mine} oninput={fromMine} placeholder="(256) 734-…" autocomplete="tel" maxlength="20" />
		</label>
		<p class="muted">Or enter them directly:</p>
		<div class="btn-row">
			<label><span>Area code</span><input type="text" inputmode="numeric" bind:value={npa} required pattern="[2-9][0-9]{2}" maxlength="3" placeholder="256" /></label>
			<label><span>Prefix (optional)</span><input type="text" inputmode="numeric" bind:value={nxx} pattern="[2-9][0-9]{2}" maxlength="3" placeholder="734" /></label>
		</div>
		<button class="btn" type="submit" disabled={busy}>{busy ? "Searching…" : "Find look-alike spam numbers"}</button>
		<p class="muted">Only the area code and prefix are sent; nothing is saved.</p>
		{#if error}<p class="form-error" role="alert">{error}</p>{/if}
	</form>

	<div class="tool-card" aria-live="polite">
		<h2>Results</h2>
		{#if result}
			{#if !result.inService}<p class="form-error">{result.npa} isn’t an in-service U.S. geographic area code in the NANPA list. Double-check it.</p>{/if}
			{#if result.nxx}
				<p><strong>{result.prefixTotal}</strong> reported number{result.prefixTotal === 1 ? "" : "s"} start with <span class="code">{result.npa}-{result.nxx}</span>.</p>
			{/if}
			<p><strong>{result.areaTotal.toLocaleString("en-US")}</strong> reported numbers with area code <a href={`/area-code/${result.npa}`}>{result.npa}</a> ({result.areaComplaints.toLocaleString("en-US")} FTC/FCC complaints).</p>

			<fieldset class="pro-options">
				<legend>Contact card contents</legend>
				<label class="check-label"><input type="radio" bind:group={scope} value="prefix" disabled={!result.nxx} /> Only my prefix ({result.prefixNumbers.length})</label>
				<label class="check-label"><input type="radio" bind:group={scope} value="area" /> My prefix + top reported numbers in {result.npa}</label>
				{#if result.nxx}
					<label class="check-label"><input type="checkbox" bind:checked={useRange} /> Add a custom range in {result.npa}-{result.nxx} (max 1,000)</label>
					{#if useRange}
						<div class="btn-row">
							<label><span>From</span><input type="text" inputmode="numeric" bind:value={from} maxlength="4" pattern="[0-9]{4}" /></label>
							<label><span>To</span><input type="text" inputmode="numeric" bind:value={to} maxlength="4" pattern="[0-9]{4}" /></label>
						</div>
						<p class="muted">{rangeOk ? `${rangeCount} numbers, ${result.npa}-${result.nxx}-${from} to ${result.npa}-${result.nxx}-${String(Math.min(Number(to), Number(from) + 999)).padStart(4, "0")}.` : "Enter two 4-digit endings, low to high."} This can block real neighbors — keep Screen Unknown Callers on as a backup instead of blocking widely.</p>
					{/if}
				{/if}
			</fieldset>
			<div class="btn-row">
				<a class="btn" href={vcfHref} download>Download contact card ({vcfCount} numbers)</a>
				<a class="btn secondary" href="/blocklist">How to import &amp; block it</a>
			</div>

			{#if result.prefixNumbers.length || result.areaNumbers.length}
				<h3>{result.prefixNumbers.length ? `Reported numbers in ${result.npa}-${result.nxx}` : `Most-reported numbers in ${result.npa}`}</h3>
				<ul class="guide-index">
					{#each (result.prefixNumbers.length ? result.prefixNumbers : result.areaNumbers).slice(0, 15) as n}
						<li><a href={`/number/${e164ToSlug(n.e164)}`}>{formatNational(n.e164)}</a> — {n.total_gov_count} complaint{n.total_gov_count === 1 ? "" : "s"}{n.top_subject ? ` · ${n.top_subject}` : ""}</li>
					{/each}
				</ul>
			{/if}
		{:else}
			<p class="muted">Enter your area code and prefix to see real reported look-alike numbers and build your contact card.</p>
		{/if}
	</div>
</section>

<section>
	<h2>Silence the rest of the neighbor spoofs (free)</h2>
	<ol class="step-list">
		<li><strong>iPhone (iOS 26):</strong> Settings → Apps → Phone → Screen Unknown Callers → Ask Reason for Calling. Numbers not in your contacts are asked who they are before your phone rings. On iOS 18, turn on Silence Unknown Callers.</li>
		<li><strong>Android (Google Phone):</strong> Phone → ⋮ → Settings → Spam and Call Screen → turn on Filter spam calls and set up Call Screen for unknown numbers. Samsung: Phone → ⋮ → Settings → Caller ID and spam protection.</li>
		<li><strong>Carrier:</strong> turn on Verizon Call Filter, AT&amp;T ActiveArmor, or T-Mobile Scam Shield (free tiers on many plans). <a href="/setup">Exact steps in the setup wizard</a>.</li>
		<li><strong>Import and block the card:</strong> open the downloaded .vcf, save it to Contacts, then open the contact → Block this Caller (iPhone) or ⋮ → Block numbers (Android).</li>
	</ol>
	<p class="muted">Learn more in the FCC’s <a href="https://www.fcc.gov/spoofing" rel="noopener noreferrer">caller ID spoofing guide</a>. No tool can block every spoofed call.</p>
</section>

<EmailCaptureBar
	headline="Get alerts when new spam numbers in your area code are reported"
	sub="Weekly scam alerts for your area code, plus vote on Pro: automatic prefix blocking. Free, unsubscribe anytime."
	leadMagnet="neighbor_spoof"
	contextValue={result?.npa ?? null}
	button="Alert me"
	unlockedText="You’ll get alerts for your area."
/>

<Faq {faqs} />
<p>Related: <a href="/area-code">area-code directory</a> · <a href="/blocklist">Top-100 blocklist</a> · <a href="/voicemail-shield">voicemail shield</a> · <a href="/compare">paid apps compared</a></p>
