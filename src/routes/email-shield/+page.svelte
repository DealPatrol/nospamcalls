<script lang="ts">
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import { postJson } from "#lib/account";
	import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, type Crumb } from "#lib/seo";
	import type { PageProps } from "./$types";

	type Flag = { level: "high" | "medium" | "info"; text: string };
	type DomainInfo = { domain: string; spf: string | null; dmarc: string | null; dmarcPolicy: string | null; mx: string[]; error: string | null };
	type Analysis = {
		from: string | null; fromDomain: string | null; returnPath: string | null; returnPathDomain: string | null;
		replyTo: string | null; replyToDomain: string | null; subject: string | null; date: string | null; messageId: string | null;
		auth: { spf: string | null; dkim: string | null; dmarc: string | null; raw: string | null };
		dkimDomains: string[]; hops: { ip: string; host: string | null }[]; originIp: { ip: string; host: string | null } | null;
		rdap: { ip: string; network: string | null; org: string | null; country: string | null; abuseEmails: string[]; source: string } | null;
		domains: DomainInfo[]; listUnsubscribe: string | null; oneClickUnsubscribe: boolean; flags: Flag[];
	};

	let { data }: PageProps = $props();
	const origin = $derived(data.origin);
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/email-shield", label: "Email spam shield" }
	];
	const title = "Email spam shield: header analyzer, abuse report & Gmail filter builder";
	const description =
		"Paste raw email headers to see who really sent a spam or phishing email (SPF, DKIM, DMARC, originating IP and network owner), draft an abuse report, and download Gmail filters — no Gmail login required.";

	let mode = $state<"headers" | "domain">("headers");
	let headers = $state("");
	let domain = $state("");
	let busy = $state(false);
	let error = $state("");
	let analysis = $state<Analysis | null>(null);
	let domainResult = $state<DomainInfo | null>(null);
	let copied = $state("");

	async function analyze(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		error = "";
		analysis = null;
		domainResult = null;
		try {
			if (mode === "headers") {
				const res = await postJson<{ analysis: Analysis }>("/api/email-analyze", { headers });
				analysis = res.analysis;
				if (res.analysis.fromDomain) addTerm("domains", res.analysis.fromDomain);
			} else {
				const res = await postJson<{ domain: DomainInfo }>("/api/email-analyze", { domain });
				domainResult = res.domain;
				addTerm("domains", res.domain.domain);
			}
		} catch (err) {
			error = (err as Error).message;
		} finally {
			busy = false;
		}
	}

	const abuseTo = $derived(analysis?.rdap?.abuseEmails.join(",") ?? "");
	const abuseSubject = $derived(`Spam/phishing report${analysis?.originIp ? ` from ${analysis.originIp.ip}` : ""}${analysis?.fromDomain ? ` (${analysis.fromDomain})` : ""}`);
	const abuseBody = $derived(
		analysis
			? `Hello abuse team,

I received an unsolicited${analysis.flags.some((f) => f.level === "high") ? " and likely spoofed/phishing" : ""} email that appears to originate from your network.

Originating IP: ${analysis.originIp?.ip ?? "unknown"}${analysis.originIp?.host ? ` (${analysis.originIp.host})` : ""}
From: ${analysis.from ?? "unknown"}
Return-Path: ${analysis.returnPath ?? "unknown"}
Reply-To: ${analysis.replyTo ?? "none"}
Subject: ${analysis.subject ?? ""}
Date: ${analysis.date ?? ""}
Message-ID: ${analysis.messageId ?? ""}
Authentication: SPF=${analysis.auth.spf ?? "n/a"}, DKIM=${analysis.auth.dkim ?? "n/a"}, DMARC=${analysis.auth.dmarc ?? "n/a"}
DKIM signer(s): ${analysis.dkimDomains.join(", ") || "none"}

Please investigate and stop this sender. The full original headers are pasted below.

---- FULL HEADERS ----
${headers.trim()}`
			: ""
	);
	const abuseMailto = $derived(
		`mailto:${encodeURIComponent(abuseTo)}?subject=${encodeURIComponent(abuseSubject)}&body=${encodeURIComponent(abuseBody.slice(0, 1800) + (abuseBody.length > 1800 ? "\n\n[Headers truncated — paste the full copy from NoSpamCalls]" : ""))}`
	);

	async function copy(text: string, what: string) {
		await navigator.clipboard.writeText(text);
		copied = what;
		setTimeout(() => (copied = ""), 2500);
	}

	// ---- Filter builder ----
	let domains = $state<string[]>([]);
	let senders = $state<string[]>([]);
	let phrases = $state<string[]>([]);
	let newTerm = $state("");
	let termType = $state<"domains" | "senders" | "phrases">("domains");
	let action = $state<"trash" | "archive">("trash");
	let newsletterSweep = $state(false);

	const PRESETS = {
		"Cold sales pitches": ["quick question", "15 minutes on your calendar", "book a quick call", "following up on my last email"],
		"Fake invoice & loan spam": ["invoice attached", "payment overdue", "final notice", "pre-approved", "you have been approved"],
		"Prize & crypto scams": ["you have won", "claim your prize", "crypto investment", "gift card"]
	} as const;

	function addTerm(type: "domains" | "senders" | "phrases", raw: string) {
		const value = raw.trim().toLowerCase().replace(/^@/, "");
		if (!value) return;
		const list = type === "domains" ? domains : type === "senders" ? senders : phrases;
		if (list.includes(value)) return;
		if (type === "domains") domains = [...domains, value];
		else if (type === "senders") senders = [...senders, value];
		else phrases = [...phrases, value];
	}
	function removeTerm(type: "domains" | "senders" | "phrases", value: string) {
		if (type === "domains") domains = domains.filter((v) => v !== value);
		else if (type === "senders") senders = senders.filter((v) => v !== value);
		else phrases = phrases.filter((v) => v !== value);
	}
	function addNew(event: SubmitEvent) {
		event.preventDefault();
		for (const part of newTerm.split(/[,\n]/)) addTerm(termType, part);
		newTerm = "";
	}

	const termGroups = $derived([
		{ type: "domains" as const, label: "Domains", list: domains },
		{ type: "senders" as const, label: "Senders", list: senders },
		{ type: "phrases" as const, label: "Phrases", list: phrases }
	]);

	const xmlEscape = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
	const fromQuery = $derived([...domains, ...senders].join(" OR "));
	const phraseQuery = $derived(phrases.map((p) => `"${p}"`).join(" OR "));
	const gmailQuery = $derived(
		[fromQuery && `from:(${fromQuery})`, phraseQuery && `(${phraseQuery})`, newsletterSweep && "unsubscribe"].filter(Boolean).join("  |  ")
	);

	function entry(i: number, props: [string, string][]) {
		const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
		const actions: [string, string][] =
			action === "trash" ? [["shouldTrash", "true"]] : [["label", "NoSpamCalls"], ["shouldArchive", "true"], ["shouldMarkAsRead", "true"]];
		return `\t<entry>\n\t\t<category term='filter'></category>\n\t\t<title>Mail Filter</title>\n\t\t<id>tag:mail.google.com,2008:filter:nospamcalls${Date.now()}${i}</id>\n\t\t<updated>${now}</updated>\n\t\t<content></content>\n${[...props, ...actions].map(([k, v]) => `\t\t<apps:property name='${k}' value='${xmlEscape(v)}'/>`).join("\n")}\n\t</entry>`;
	}
	const gmailXml = $derived.by(() => {
		const entries: string[] = [];
		if (fromQuery) entries.push(entry(1, [["from", fromQuery]]));
		if (phraseQuery) entries.push(entry(2, [["hasTheWord", phraseQuery]]));
		if (newsletterSweep) {
			const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
			entries.push(`\t<entry>\n\t\t<category term='filter'></category>\n\t\t<title>Mail Filter</title>\n\t\t<id>tag:mail.google.com,2008:filter:nospamcalls${Date.now()}3</id>\n\t\t<updated>${now}</updated>\n\t\t<content></content>\n\t\t<apps:property name='hasTheWord' value='unsubscribe'/>\n\t\t<apps:property name='label' value='Newsletters'/>\n\t\t<apps:property name='shouldArchive' value='true'/>\n\t</entry>`);
		}
		return `<?xml version='1.0' encoding='UTF-8'?>\n<feed xmlns='http://www.w3.org/2005/Atom' xmlns:apps='http://schemas.google.com/apps/2006'>\n\t<title>Mail Filters</title>\n\t<author>\n\t\t<name>NoSpamCalls</name>\n\t</author>\n${entries.join("\n")}\n</feed>\n`;
	});
	const hasRules = $derived(Boolean(fromQuery || phraseQuery || newsletterSweep));

	function downloadXml() {
		const blob = new Blob([gmailXml], { type: "application/xml" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "mailFilters.xml";
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
	}

	const steps = [
		{ name: "Copy the raw headers", text: "In Gmail open the email, click More (⋮) → Show original → Copy to clipboard. In Outlook choose View → View message details. In Apple Mail choose View → Message → All Headers." },
		{ name: "Analyze", text: "Paste the headers. The tool checks SPF, DKIM and DMARC, finds the originating IP, looks up the network owner and its abuse contact, and flags spoofing." },
		{ name: "Report and filter", text: "Send the prepared abuse report from your own email, then download mailFilters.xml and import it in Gmail (Settings → Filters and Blocked Addresses → Import filters)." }
	];
	const faqs = [
		{ q: "How can I tell if an email is spoofed?", a: "Look at the Authentication-Results header. A DMARC fail means the visible From domain did not authenticate. A Reply-To on a different domain than From, an SPF fail, or a From domain with no DNS records are other strong warning signs." },
		{ q: "How do I find out who really sent a spam email?", a: "The bottom-most Received header with a public IP address is usually where the message entered the internet. Looking up that IP in RDAP shows the network owner and its abuse contact, and the DKIM signer (d=) and Return-Path often reveal the email service provider used." },
		{ q: "Does this tool store my email?", a: "No. Headers are analyzed in memory to answer your request and are never written to our database or logs. The filter builder runs entirely in your browser." },
		{ q: "Why not just connect my Gmail?", a: "Apps that read Gmail need Google’s restricted-scope verification and a paid annual security assessment, and they get access to your whole inbox. Importing a filter file gives you the same blocking with zero access to your account." },
		{ q: "Should I click unsubscribe?", a: "Only for real companies you recognize. For scams and phishing, do not click anything — block, report, and delete." }
	];
</script>

<SeoHead
	{title}
	{description}
	canonical={`${origin}/email-shield`}
	jsonLd={[
		breadcrumbJsonLd(origin, crumbs),
		webAppJsonLd({ origin, path: "/email-shield", name: "NoSpamCalls email header analyzer & Gmail filter builder", description }),
		howToJsonLd({ name: "How to trace and block a spam email", description, steps }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<h1>Email spam shield</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		Paste a spam email’s raw headers to see who really sent it — SPF, DKIM and DMARC results, the originating IP, the network
		that owns it, and where to report abuse. Then download ready-made Gmail filters or copy Outlook and Apple Mail rules. No
		login to your email account, and headers are never stored.
	</p>
</div>

<section class="hero-grid">
	<form class="tool-form tool-card" onsubmit={analyze}>
		<div class="tabs">
			<button type="button" class="btn small secondary" aria-pressed={mode === "headers"} onclick={() => (mode = "headers")}>Paste headers</button>
			<button type="button" class="btn small secondary" aria-pressed={mode === "domain"} onclick={() => (mode = "domain")}>Check a sender domain</button>
		</div>
		{#if mode === "headers"}
			<label>
				<span>Raw email headers (Gmail: ⋮ → Show original)</span>
				<textarea bind:value={headers} rows="10" required placeholder="Received: from ...&#10;Authentication-Results: ...&#10;From: ..."></textarea>
			</label>
		{:else}
			<label><span>Sender domain or email address</span><input type="text" bind:value={domain} required placeholder="example.com" /></label>
		{/if}
		<button class="btn" type="submit" disabled={busy}>{busy ? "Analyzing…" : "Analyze"}</button>
		<p class="muted">Analyzed in memory only — never stored.</p>
		{#if error}<p class="form-error">{error}</p>{/if}
	</form>
	<div class="tool-card">
		<h2>Results</h2>
		{#if analysis}
			<ul class="flag-list">
				{#each analysis.flags as f}<li class={f.level}>{f.text}</li>{/each}
				{#if !analysis.flags.length}<li>No obvious spoofing signs. It can still be unwanted spam.</li>{/if}
			</ul>
			<table class="data-table">
				<tbody>
					<tr><th>From</th><td>{analysis.from ?? "—"}</td></tr>
					<tr><th>Return-Path</th><td>{analysis.returnPath ?? "—"}</td></tr>
					<tr><th>Reply-To</th><td>{analysis.replyTo ?? "—"}</td></tr>
					<tr><th>SPF / DKIM / DMARC</th><td>
						<span class={`pill ${analysis.auth.spf === "pass" ? "ok" : analysis.auth.spf ? "high" : ""}`}>SPF {analysis.auth.spf ?? "n/a"}</span>
						<span class={`pill ${analysis.auth.dkim === "pass" ? "ok" : analysis.auth.dkim ? "high" : ""}`}>DKIM {analysis.auth.dkim ?? "n/a"}</span>
						<span class={`pill ${analysis.auth.dmarc === "pass" ? "ok" : analysis.auth.dmarc ? "high" : ""}`}>DMARC {analysis.auth.dmarc ?? "n/a"}</span>
					</td></tr>
					<tr><th>DKIM signer</th><td>{analysis.dkimDomains.join(", ") || "—"}</td></tr>
					<tr><th>Originating IP</th><td>{analysis.originIp ? `${analysis.originIp.ip}${analysis.originIp.host ? ` (${analysis.originIp.host})` : ""}` : "Not found"}</td></tr>
					<tr><th>Network owner</th><td>{analysis.rdap ? `${analysis.rdap.org ?? analysis.rdap.network ?? "Unknown"}${analysis.rdap.country ? `, ${analysis.rdap.country}` : ""}` : "—"}</td></tr>
					<tr><th>Abuse contact</th><td>{analysis.rdap?.abuseEmails.join(", ") || "—"}</td></tr>
				</tbody>
			</table>
			{#each analysis.domains as d}
				<p><strong>{d.domain}</strong>: SPF {d.spf ? "published" : "missing"} · DMARC {d.dmarcPolicy ? `p=${d.dmarcPolicy}` : "missing"} · MX {d.mx[0] ?? "none"}</p>
			{/each}
			<h3>Abuse report</h3>
			<div class="btn-row">
				<a class="btn" href={abuseMailto}>Open abuse email{abuseTo ? ` to ${abuseTo}` : ""}</a>
				<button class="btn secondary" type="button" onclick={() => copy(`To: ${abuseTo}\nSubject: ${abuseSubject}\n\n${abuseBody}`, "abuse")}>{copied === "abuse" ? "Copied" : "Copy full report"}</button>
			</div>
			<p class="muted">Also forward phishing to <span class="code">reportphishing@apwg.org</span> and report fraud at <a href="https://reportfraud.ftc.gov/" rel="noopener noreferrer">ReportFraud.ftc.gov</a>.</p>
		{:else if domainResult}
			<table class="data-table">
				<tbody>
					<tr><th>Domain</th><td>{domainResult.domain}</td></tr>
					<tr><th>SPF</th><td class="code">{domainResult.spf ?? "None published"}</td></tr>
					<tr><th>DMARC</th><td class="code">{domainResult.dmarc ?? "None published"}</td></tr>
					<tr><th>Mail servers (MX)</th><td>{domainResult.mx.join(", ") || "None"}</td></tr>
				</tbody>
			</table>
			{#if domainResult.error}<p class="form-error">{domainResult.error}</p>{/if}
			{#if !domainResult.dmarc}<p>No DMARC policy: email “from” this domain is easy to spoof.</p>{:else if domainResult.dmarcPolicy === "none"}<p>DMARC is monitor-only (p=none): spoofed mail is not blocked.</p>{/if}
		{:else}
			<p class="muted">Results appear here. The sender domain is added to your filter list automatically.</p>
		{/if}
	</div>
</section>

<section id="filters">
	<h2>Gmail filter builder (no login) + Outlook &amp; Apple Mail rules</h2>
	<div class="hero-grid">
		<div class="tool-card">
			<form class="tool-form" onsubmit={addNew}>
				<label>
					<span>Add</span>
					<select bind:value={termType}>
						<option value="domains">Sender domains</option>
						<option value="senders">Sender email addresses</option>
						<option value="phrases">Phrases</option>
					</select>
				</label>
				<label><span>Values (comma separated)</span><input type="text" bind:value={newTerm} placeholder="spammy-domain.com, deals@example.net" /></label>
				<button class="btn small" type="submit">Add</button>
			</form>
			<p><strong>Preset packs:</strong></p>
			<div class="btn-row">
				{#each Object.entries(PRESETS) as [name, words]}
					<button class="btn small secondary" type="button" onclick={() => words.forEach((w) => addTerm("phrases", w))}>{name}</button>
				{/each}
				<button class="btn small secondary" type="button" aria-pressed={newsletterSweep} onclick={() => (newsletterSweep = !newsletterSweep)}>Bulk newsletter sweep {newsletterSweep ? "✓" : ""}</button>
			</div>
			{#each termGroups as group}
				{#if group.list.length}
					<p>
						<span class="muted">{group.label}:</span>
						{#each group.list as v}
							<button class="pill" type="button" title="Remove" onclick={() => removeTerm(group.type, v)}>{v} ✕</button>{" "}
						{/each}
					</p>
				{/if}
			{/each}
			<label class="inline"><input type="radio" bind:group={action} value="trash" /> Delete matching mail</label>
			<label class="inline"><input type="radio" bind:group={action} value="archive" /> Skip inbox, label “NoSpamCalls”, mark read</label>
		</div>
		<div class="tool-card">
			<h3>Gmail</h3>
			<p class="muted">Search preview (test it in Gmail’s search box first):</p>
			<p class="code">{gmailQuery || "Add a domain, sender, or phrase"}</p>
			<div class="btn-row">
				<button class="btn" type="button" disabled={!hasRules} onclick={downloadXml}>Download mailFilters.xml</button>
			</div>
			<ol class="step-list">
				<li>Gmail on a computer → ⚙ Settings → <strong>See all settings</strong> → <strong>Filters and Blocked Addresses</strong>.</li>
				<li>Click <strong>Import filters</strong> → choose <span class="code">mailFilters.xml</span> → <strong>Open file</strong> → <strong>Create filters</strong>.</li>
			</ol>
			<h3>Outlook</h3>
			<ol class="step-list">
				<li>Settings → Mail → <strong>Rules</strong> → <strong>Add new rule</strong>.</li>
				<li>Condition: <strong>From</strong> contains {[...domains, ...senders].join(", ") || "[your domains]"}{phrases.length ? `; or Subject or body includes ${phrases.join(", ")}` : ""}.</li>
				<li>Action: <strong>Delete</strong> or <strong>Move to Junk Email</strong>. Save.</li>
			</ol>
			<h3>Apple Mail</h3>
			<ol class="step-list">
				<li>Mail → Settings → <strong>Rules</strong> → <strong>Add Rule</strong>. Set “If <strong>any</strong> of the following conditions are met.”</li>
				<li>Add one “From contains” row per domain or sender{phrases.length ? ", and “Message content contains” rows for each phrase" : ""}.</li>
				<li>Perform: <strong>Move Message</strong> to <strong>Junk</strong> (or Trash). Click OK, then Apply.</li>
			</ol>
		</div>
	</div>
</section>

<section class="tool-card">
	<h2>Stop the next spam email before it starts: free masked email aliases</h2>
	<p>Give every website its own forwarding address. If one starts getting spam, turn that alias off.</p>
	<ul>
		<li><a href="https://duckduckgo.com/email/" rel="noopener noreferrer">DuckDuckGo Email Protection</a> — free @duck.com aliases that also strip many email trackers.</li>
		<li><a href="https://simplelogin.io/" rel="noopener noreferrer">SimpleLogin</a> (by Proton) — free plan with 10 aliases.</li>
		<li><a href="https://addy.io/" rel="noopener noreferrer">addy.io</a> — open-source forwarding with a free plan.</li>
	</ul>
	<p class="muted">Remove your email from data brokers too, in the <a href="/opt-out">opt-out center</a>.</p>
</section>

<Faq {faqs} />
