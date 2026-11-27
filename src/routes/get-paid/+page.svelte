<script lang="ts">
	import { onMount } from "svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import EmailCaptureBar from "#lib/components/EmailCaptureBar.svelte";
	import UnlockGate from "#lib/components/UnlockGate.svelte";
	import ProCallout from "#lib/components/ProCallout.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import { getAccountKey, postJson, setAccountKey } from "#lib/account";
	import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, type Crumb } from "#lib/seo";
	import { formatNational } from "#lib/phone";
	import type { PageProps } from "./$types";

	type Log = {
		id: number;
		e164: string;
		occurred_at: string;
		call_or_text: string;
		company_name: string | null;
		company_contact: string | null;
		used_automated: boolean;
		on_dnc_31_days: boolean;
		revoked_consent_at: string | null;
		summary: string | null;
	};

	let { data }: PageProps = $props();
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/get-paid", label: "Get paid from spam callers" }
	];
	const title = "Get Paid for Spam Calls: $500–$1,500 per Illegal Robocall (TCPA)";
	const description =
		"Yes, you can get money from illegal spam calls: the TCPA sets $500 per violation, up to $1,500 if willful. Check open settlements, estimate your claim, log calls free, and print a demand letter. Not legal advice.";
	const canonical = $derived(`${data.origin}/get-paid`);
	const DISCLAIMER =
		"NoSpamCalls is not a law firm and does not give legal advice. Statutory amounts under 47 U.S.C. § 227 are legal maximums, not guaranteed recoveries.";

	function fmtDeadline(d: string) {
		return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
	}
	function daysLeft(d: string) {
		return Math.max(0, Math.ceil((new Date(`${d}T23:59:59Z`).getTime() - Date.now()) / 86400000));
	}

	// ---- Estimator ----
	let calls = $state(3);
	let robocall = $state(true);
	let dnc = $state(false);
	let toldStop = $state(false);
	let fdcpa = $state(false);
	let stateCode = $state("");
	const STRONG_STATES: Record<string, string> = {
		FL: "Florida Telephone Solicitation Act (FTSA) may add separate state claims for unwanted telemarketing calls and texts.",
		OK: "Oklahoma Telephone Solicitation Act may add separate state claims for unwanted telemarketing calls and texts.",
		WA: "Washington’s Commercial Electronic Mail Act covers commercial text messages and may add a separate state claim.",
		MD: "Maryland’s Stop the Spam Calls Act may add separate state claims for telephone solicitations."
	};
	const n = $derived(Math.max(0, Math.min(10000, Math.floor(Number(calls) || 0))));
	const perCall = $derived(toldStop ? 1500 : 500);
	const bClaim = $derived(robocall ? n * 500 : 0);
	const bWillful = $derived(robocall ? n * 1500 : 0);
	const dncEligible = $derived(dnc && n >= 2);
	const cClaim = $derived(dncEligible ? n * 500 : 0);
	const cWillful = $derived(dncEligible ? n * 1500 : 0);
	const low = $derived(Math.max(bClaim, cClaim));
	const high = $derived(Math.max(bWillful, cWillful) + (fdcpa ? 1000 : 0));
	const usd = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

	// ---- Evidence log ----
	let key = $state("");
	let logs = $state<Log[]>([]);
	let logNumber = $state("");
	let occurredAt = $state("");
	let callOrText = $state("call");
	let companyName = $state("");
	let companyContact = $state("");
	let usedAutomated = $state(true);
	let onDnc = $state(false);
	let revokedAt = $state("");
	let summary = $state("");
	let email = $state("");
	let logBusy = $state(false);
	let logMsg = $state("");
	let logErr = $state("");

	onMount(async () => {
		key = getAccountKey();
		if (data.prefill) logNumber = data.prefill;
		const now = new Date();
		occurredAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
		const res = await fetch(`/api/tcpa-log?key=${key}`);
		if (res.ok) logs = (await res.json()).logs;
	});

	async function saveLog(event: SubmitEvent) {
		event.preventDefault();
		logBusy = true;
		logErr = "";
		logMsg = "";
		try {
			const res = await postJson<{ key: string; logs: Log[] }>("/api/tcpa-log", {
				key,
				email,
				number: logNumber,
				occurredAt: occurredAt ? new Date(occurredAt).toISOString() : "",
				callOrText,
				companyName,
				companyContact,
				usedAutomated,
				onDnc,
				revokedConsentAt: revokedAt,
				summary
			});
			key = res.key;
			setAccountKey(res.key);
			logs = res.logs;
			logMsg = "Saved to your evidence log.";
			summary = "";
		} catch (err) {
			logErr = (err as Error).message;
		} finally {
			logBusy = false;
		}
	}

	async function deleteLog(id: number) {
		const res = await postJson<{ logs: Log[] }>("/api/tcpa-log", { key, id }, "DELETE");
		logs = res.logs;
	}

	const fmtWhen = (iso: string) =>
		new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

	const packet = $derived(
		[
			"TCPA EVIDENCE LOG",
			`Prepared ${new Date().toLocaleDateString("en-US")} with nospamcalls.org (educational self-help; not legal advice)`,
			"",
			...logs.map(
				(l, i) =>
					`${i + 1}. ${fmtWhen(l.occurred_at)} — ${l.call_or_text.toUpperCase()} from ${formatNational(l.e164)}` +
					(l.company_name ? ` | Company: ${l.company_name}` : "") +
					(l.company_contact ? ` | Contact/website: ${l.company_contact}` : "") +
					` | Automated/prerecorded: ${l.used_automated ? "yes" : "no/unsure"}` +
					` | On Do Not Call 31+ days: ${l.on_dnc_31_days ? "yes" : "no/unsure"}` +
					(l.revoked_consent_at ? ` | Told them to stop on: ${l.revoked_consent_at}` : "") +
					(l.summary ? `\n   Notes: ${l.summary}` : "")
			),
			"",
			`Total incidents: ${logs.length}`
		].join("\n")
	);

	// ---- Demand letter ----
	let yourName = $state("");
	let yourCity = $state("");
	let yourContact = $state("");
	let yourPhone = $state("");
	let coName = $state("");
	let coAddress = $state("");
	let manualCount = $state(0);
	let replyDays = $state(30);
	let copied = $state("");

	const letterCount = $derived(logs.length || Math.max(0, Math.floor(Number(manualCount) || 0)));
	const letterHasDnc = $derived(logs.some((l) => l.on_dnc_31_days));
	const letterWillful = $derived(logs.some((l) => l.revoked_consent_at));
	const letterAmount = $derived(letterCount * (letterWillful ? 1500 : 500));
	const letter = $derived(
		`${yourName || "[Your full name]"}
${yourCity || "[City, State]"}
${yourContact || "[Your email or mailing address]"}

${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

${coName || "[Company legal name]"}
${coAddress || "[Company mailing address / registered agent]"}

Re: Pre-suit notice and demand under the Telephone Consumer Protection Act, 47 U.S.C. § 227

To whom it may concern:

I am writing about ${letterCount || "[number]"} unsolicited ${letterCount === 1 ? "call or text" : "calls and/or texts"} made to my telephone number ${yourPhone || "[your phone number]"} by or on behalf of your company. The dates, times, and calling numbers are listed below.

These communications appear to violate:
• 47 U.S.C. § 227(b)(1)(A)(iii), which prohibits calls to a cellular telephone using an automatic telephone dialing system or an artificial or prerecorded voice without prior express consent${letterHasDnc ? ";\n• 47 U.S.C. § 227(c)(5) and 47 C.F.R. § 64.1200(c)(2), which prohibit more than one telephone solicitation within 12 months to a number listed on the National Do Not Call Registry for at least 31 days" : ""}${letterWillful ? ";\n• and they continued after I told you to stop, which I believe makes them willful or knowing under 47 U.S.C. § 227(b)(3) and (c)(5)" : ""}.

The statute provides for statutory damages of $500 per violation, and up to $1,500 per violation if the violation was willful or knowing. Based on the ${letterCount || "[number]"} violations listed, I calculate statutory damages of up to ${letterCount ? usd(letterAmount) : "[amount]"}.

I request that you:
1. Immediately place my number on your internal do-not-call list and stop all calls and texts to it (47 C.F.R. § 64.1200(d));
2. Send me a copy of your written do-not-call policy;
3. Identify any third party that called on your behalf; and
4. Contact me within ${replyDays} days of this letter to resolve this matter. If I do not hear from you, I may file a claim in small claims court or consult an attorney without further notice.

Please preserve all records relating to calls or texts to my number, including call logs, dialing system data, and consent records.

Call and text log:
${logs.length ? logs.map((l, i) => `${i + 1}. ${fmtWhen(l.occurred_at)} — ${l.call_or_text} from ${formatNational(l.e164)}${l.company_name ? ` (${l.company_name})` : ""}`).join("\n") : "[Add each date, time, and calling number — or log them above]"}

Sincerely,

${yourName || "[Your full name]"}`
	);

	async function copy(text: string, what: string) {
		await navigator.clipboard.writeText(text);
		copied = what;
		setTimeout(() => (copied = ""), 2500);
	}

	const steps = [
		{ name: "Check open settlements", text: "See if a court-approved TCPA class-action settlement covers the company that called you and file a claim before the deadline." },
		{ name: "Log every illegal call", text: "Record the date, time, calling number, company name, whether it was prerecorded or autodialed, and whether your number was on the Do Not Call list." },
		{ name: "Estimate statutory damages", text: "The TCPA allows $500 per violation and up to $1,500 if willful or knowing. These are maximums, not guaranteed recoveries." },
		{ name: "Send a demand or get a lawyer", text: "Print your evidence packet, send a self-help demand letter, file in small claims court, or contact a consumer attorney who works on contingency." }
	];
	const faqs = $derived([
		{ q: "How much can I get for a robocall?", a: "The TCPA (47 U.S.C. § 227) sets statutory damages at $500 per violation, and a court may award up to $1,500 per violation if it was willful or knowing. These are legal maximums; you must prove the violation and collect the judgment, and many cases settle for less." },
		{ q: "Can you really get paid for spam calls?", a: "Sometimes. You get paid only when a call broke the TCPA and you can tie it to a company: by filing a claim in an open class-action settlement, by settling after a demand letter, or by winning in small claims or with a lawyer. A spoofed call you cannot trace to anyone usually pays nothing, so log the company name and callback number when you can." },
		{ q: "Can I get paid for spam texts too?", a: "Often, yes. The FCC and the Supreme Court (Campbell-Ewald Co. v. Gomez, 2016) treat a text message as a “call” under the TCPA, so autodialed marketing texts sent without your consent can carry the same $500 to $1,500 per-message damages. Log texts in the evidence log on this page; it records calls and texts separately." },
		{ q: "What counts as an illegal robocall?", a: "Generally, calls to a cell phone using a prerecorded or artificial voice or an autodialer without your prior express consent, and more than one telemarketing call in 12 months to a number on the National Do Not Call Registry for 31+ days. Exceptions exist, such as emergency calls and some calls with consent." },
		{ q: "How do I find out who is really behind a spoofed robocall?", a: "Stay on the line long enough to hear the product, company name, website, or callback number, and write it down. Never give your Social Security number, bank or card details. The company name and a working callback number are what make a claim possible." },
		{ q: "Do I need a lawyer?", a: "No for small claims court in most states, but a consumer protection attorney can tell you if you have a case. Many TCPA lawyers work on contingency, so there is no upfront fee. NoSpamCalls takes no fee or referral payment." },
		{ q: "Are the class-action settlements on this page real?", a: `Yes. Each one was checked on its official, court-authorized settlement website on ${data.checked}, and expired ones are hidden automatically. Always file only through the official site.` }
	]);
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		webAppJsonLd({ origin: data.origin, path: "/get-paid", name: "NoSpamCalls TCPA evidence log & demand letter tool", description, category: "UtilitiesApplication" }),
		howToJsonLd({ name: "How to get money from illegal robocalls under the TCPA", description, steps }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<h1>Get paid for spam calls: how to get money from illegal robocalls</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		Under the Telephone Consumer Protection Act, illegal robocalls and repeat calls to numbers on the Do Not Call list carry
		statutory damages of $500 per violation, up to $1,500 if willful. You can claim from open class-action settlements, log
		calls and send a demand letter yourself, or hand your evidence to a consumer lawyer who works on contingency.
	</p>
</div>
<p class="legal-note"><strong>Educational self-help tool.</strong> {DISCLAIMER} Nothing here is sent on your behalf — you review and send everything yourself.</p>

<section id="settlements">
	<h2>1. Open TCPA class-action settlements</h2>
	{#if data.settlements.length}
		<p class="muted">Checked on each official settlement website on {data.checked}. Only file through the official site.</p>
		<div class="tool-grid">
			{#each data.settlements as s}
				<article class="tool-card">
					<p><span class="pill high">Claim by {fmtDeadline(s.deadline)}</span> <span class="muted">{daysLeft(s.deadline)} days left</span></p>
					<h3>{s.caseName}</h3>
					<p class="muted">{s.court}</p>
					<p><strong>Who qualifies:</strong> {s.whoQualifies}</p>
					<p><strong>Payment:</strong> {s.payment}</p>
					<p><a class="btn small" href={s.url} rel="noopener noreferrer" target="_blank">Official claim site</a></p>
				</article>
			{/each}
		</div>
	{:else}
		<p>No TCPA settlements are verified open right now. Get an email when we verify a new one.</p>
	{/if}
	<EmailCaptureBar
		headline="Get an email the day a new $500–$1,500-type TCPA settlement opens"
		sub="We check official, court-approved settlement sites and only email verified claims you can file yourself. Free."
		leadMagnet="settlement_alert"
		button="Alert me free"
		unlockedText="We’ll email you when we verify a new TCPA settlement."
		alwaysAsk
	/>
	<div>
		<p class="muted">Also check the FTC’s official list of <a href="https://www.ftc.gov/refunds" rel="noopener noreferrer">FTC refund programs</a>.</p>
	</div>
</section>

<section id="estimate">
	<h2>2. Statutory claim estimator</h2>
	<div class="hero-grid">
		<form class="tool-form tool-card" onsubmit={(e) => e.preventDefault()}>
			<label><span>How many illegal calls or texts?</span><input type="number" min="0" max="10000" bind:value={calls} /></label>
			<label class="inline"><input type="checkbox" bind:checked={robocall} /> Prerecorded/robot voice or autodialed, to a cell phone, without my consent</label>
			<label class="inline"><input type="checkbox" bind:checked={dnc} /> My number was on the National Do Not Call list for 31+ days (telemarketing)</label>
			<label class="inline"><input type="checkbox" bind:checked={toldStop} /> I told them to stop (revoked consent) and they kept calling</label>
			<label class="inline"><input type="checkbox" bind:checked={fdcpa} /> A debt collector harassed me or broke collection rules</label>
			<label>
				<span>Your state</span>
				<select bind:value={stateCode}>
					<option value="">Other / not sure</option>
					<option value="FL">Florida</option>
					<option value="OK">Oklahoma</option>
					<option value="WA">Washington</option>
					<option value="MD">Maryland</option>
				</select>
			</label>
		</form>
		<div class="tool-card">
			<p class="answer-label">Possible statutory range</p>
			<p class="price">{usd(toldStop ? high : low)}{#if !toldStop && high > low}<small> – {usd(high)} if willful</small>{/if}</p>
			<ul>
				{#if robocall}<li>§ 227(b) robocall/autodialer: {n} × {usd(500)}{toldStop ? ` (up to ${usd(1500)} each if willful)` : ""} = {usd(bClaim)}{toldStop ? ` – ${usd(bWillful)}` : ""}</li>{/if}
				{#if dnc}<li>§ 227(c)(5) Do Not Call: {dncEligible ? `${n} × ${usd(500)} = ${usd(cClaim)}${toldStop ? ` – ${usd(cWillful)}` : ""}` : "needs more than one call within 12 months"}</li>{/if}
				{#if robocall && dncEligible}<li>Some courts allow separate (b) and (c) damages for the same call; this estimate counts each call once.</li>{/if}
				{#if fdcpa}<li>FDCPA (15 U.S.C. § 1692k): up to {usd(1000)} statutory damages per lawsuit, plus actual damages and attorney’s fees.</li>{/if}
				{#if stateCode && STRONG_STATES[stateCode]}<li>{STRONG_STATES[stateCode]} Ask a local consumer attorney.</li>{/if}
				<li>Formula: violations × $500 (× up to 3 = $1,500 if willful or knowing). Per-call max used: {usd(perCall)}.</li>
			</ul>
			<p class="muted">{DISCLAIMER}</p>
		</div>
	</div>
</section>

<section id="log">
	<h2>3. Spam call evidence log</h2>
	<div class="hero-grid">
		<form class="tool-form tool-card" onsubmit={saveLog}>
			<label><span>Number that called or texted</span><input type="tel" bind:value={logNumber} required /></label>
			<label><span>Date and time</span><input type="datetime-local" bind:value={occurredAt} /></label>
			<label><span>Call or text?</span><select bind:value={callOrText}><option value="call">Call</option><option value="text">Text</option></select></label>
			<label><span>Real company name they pitched</span><input type="text" bind:value={companyName} maxlength="160" /></label>
			<label><span>Company website or callback number</span><input type="text" bind:value={companyContact} maxlength="200" /></label>
			<label class="inline"><input type="checkbox" bind:checked={usedAutomated} /> Prerecorded / robot voice, or a pause before a person came on</label>
			<label class="inline"><input type="checkbox" bind:checked={onDnc} /> My number has been on the Do Not Call list 31+ days</label>
			<label><span>Date I told them to stop (if any)</span><input type="date" bind:value={revokedAt} /></label>
			<label><span>What happened (no SSN, bank, or card numbers)</span><textarea bind:value={summary} maxlength="1000"></textarea></label>
			<label><span>Email (optional — keeps your log on any device)</span><input type="email" bind:value={email} autocomplete="email" /></label>
			<button class="btn" type="submit" disabled={logBusy}>{logBusy ? "Saving…" : "Save to evidence log"}</button>
			{#if logMsg}<p class="form-success">{logMsg}</p>{/if}
			{#if logErr}<p class="form-error">{logErr}</p>{/if}
		</form>
		<div class="tool-card">
			<h3>How to unmask the real company behind a spoofed call</h3>
			<ol class="step-list">
				<li>Don’t hang up right away. Press the option to speak to someone, or let the pitch play.</li>
				<li>Ask: “What is the company’s full name?”, “What’s your website?”, and “What number can I call you back on?” Write it down with the time.</li>
				<li>Listen for license numbers, product names, or a callback number in voicemail.</li>
				<li>Note if the voice was recorded or robotic, and whether you’ve told them to stop before.</li>
				<li><strong>Never</strong> give your Social Security number, bank, card, or Medicare details — even to “verify.”</li>
			</ol>
			<p class="muted">The caller ID number is often fake. A company name plus a working callback number or website is what makes a claim possible.</p>
		</div>
	</div>

	{#if logs.length}
		<h3>Your logged incidents ({logs.length})</h3>
		<div class="table-wrap">
			<table class="data-table">
				<thead><tr><th>When</th><th>Number</th><th>Company</th><th>Flags</th><th></th></tr></thead>
				<tbody>
					{#each logs as l}
						<tr>
							<td>{fmtWhen(l.occurred_at)}</td>
							<td>{formatNational(l.e164)} ({l.call_or_text})</td>
							<td>{l.company_name ?? "—"}</td>
							<td>{l.used_automated ? "Automated " : ""}{l.on_dnc_31_days ? "DNC " : ""}{l.revoked_consent_at ? "Told to stop" : ""}</td>
							<td><button class="btn small secondary" type="button" onclick={() => deleteLog(l.id)}>Delete</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<h3>Printable TCPA evidence packet</h3>
		<pre class="letter">{packet}</pre>
		<UnlockGate
			headline="Unlock your printable evidence packet — free"
			sub="Enter your email once to copy or print the packet and demand letter. We’ll also alert you when new TCPA settlements open."
			leadMagnet="tcpa_packet"
			contextValue="packet"
			button="Unlock packet"
		>
			<div class="btn-row no-print">
				<button class="btn" type="button" onclick={() => copy(packet, "packet")}>Copy packet</button>
				<button class="btn secondary" type="button" onclick={() => window.print()}>Print / save PDF</button>
				{#if copied === "packet"}<span class="form-success">Copied</span>{/if}
			</div>
		</UnlockGate>
	{/if}
</section>

<section id="letter">
	<h2>4. Self-help TCPA demand letter</h2>
	<p class="legal-note"><strong>Educational self-help template — not legal advice.</strong> Review and edit it before sending. You send it yourself; NoSpamCalls never contacts companies for you.</p>
	<div class="hero-grid">
		<form class="tool-form tool-card no-print" onsubmit={(e) => e.preventDefault()}>
			<label><span>Your full name</span><input type="text" bind:value={yourName} /></label>
			<label><span>Your city, state</span><input type="text" bind:value={yourCity} /></label>
			<label><span>Your email or mailing address</span><input type="text" bind:value={yourContact} /></label>
			<label><span>Your phone number that was called</span><input type="tel" bind:value={yourPhone} /></label>
			<label><span>Company legal name</span><input type="text" bind:value={coName} /></label>
			<label><span>Company address or registered agent</span><textarea bind:value={coAddress}></textarea></label>
			{#if !logs.length}<label><span>Number of calls/texts (or log them above)</span><input type="number" min="0" bind:value={manualCount} /></label>{/if}
			<label><span>Days to respond</span><select bind:value={replyDays}><option value={14}>14</option><option value={30}>30</option></select></label>
		</form>
		<div>
			<pre class="letter">{letter}</pre>
			<UnlockGate
				headline="Unlock your demand letter — free"
				sub="One email lets you copy and print the letter (and every other free download on NoSpamCalls)."
				leadMagnet="tcpa_packet"
				contextValue="demand_letter"
				button="Unlock letter"
			>
				<div class="btn-row no-print">
					<button class="btn" type="button" onclick={() => copy(letter, "letter")}>Copy letter</button>
					<button class="btn secondary" type="button" onclick={() => window.print()}>Print / save PDF</button>
					{#if copied === "letter"}<span class="form-success">Copied</span>{/if}
				</div>
			</UnlockGate>
		</div>
	</div>
	<p class="muted">Tip: look up a company’s registered agent on your Secretary of State’s business search. Send by certified mail and keep a copy.</p>
</section>

<ProCallout feature="Automated TCPA cash recovery" text="Pro will log calls automatically, identify the company behind them, and match you to open settlements." />

<section id="lawyer">
	<h2>5. Work with a consumer protection lawyer ($0 upfront)</h2>
	<p>
		Many TCPA and FDCPA attorneys take strong cases on contingency — they are paid only if you recover, and the law lets courts
		award attorney’s fees in FDCPA cases. Bring your evidence packet. NoSpamCalls takes no fee, referral payment, or fee split.
	</p>
	<ul>
		<li><a href="https://www.consumeradvocates.org/findanattorney/" rel="noopener noreferrer">NACA — Find a consumer attorney</a></li>
		<li><a href="https://reportfraud.ftc.gov/" rel="noopener noreferrer">ReportFraud.ftc.gov</a> — report the scam to the FTC</li>
		<li><a href="https://consumercomplaints.fcc.gov/" rel="noopener noreferrer">FCC Consumer Complaints</a> — report unwanted calls and texts</li>
		<li><a href="https://www.donotcall.gov/" rel="noopener noreferrer">DoNotCall.gov</a> — register and report Do Not Call violations</li>
	</ul>
</section>

<Faq {faqs} />
<p>Related: <a href="/tcpa-rights">your TCPA rights explained</a> · <a href="/blocklist">block the number</a> · <a href="/report-spam-calls">report to the FTC and FCC</a></p>
<p class="muted">{DISCLAIMER}</p>
