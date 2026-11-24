<script lang="ts">
	import { onMount } from "svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import { getAccountKey, postJson, setAccountKey } from "#lib/account";
	import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, type Crumb } from "#lib/seo";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/opt-out", label: "Data-broker opt-out center" }
	];
	const title = "Free data-broker opt-out center: remove your phone number & email";
	const description =
		"Remove your phone number and email from Whitepages, Spokeo, TruePeopleSearch, BeenVerified, Intelius, Acxiom and more with verified opt-out links, a progress tracker, and a free CCPA/state privacy deletion email generator.";
	const canonical = $derived(`${data.origin}/opt-out`);

	type Status = "todo" | "requested" | "removed";
	const LS = "nsc_optout_progress";
	let progress = $state<Record<string, Status>>({});
	let key = $state("");
	let syncEmail = $state("");
	let syncMsg = $state("");

	onMount(async () => {
		key = getAccountKey();
		try {
			progress = JSON.parse(localStorage.getItem(LS) ?? "{}");
		} catch {
			progress = {};
		}
		const res = await fetch(`/api/optout?key=${key}`).catch(() => null);
		if (res?.ok) {
			const remote = (await res.json()).progress as Record<string, Status>;
			progress = { ...progress, ...remote };
			localStorage.setItem(LS, JSON.stringify(progress));
		}
	});

	async function setStatus(slug: string, status: Status) {
		progress = { ...progress, [slug]: status };
		localStorage.setItem(LS, JSON.stringify(progress));
		postJson("/api/optout", { key, broker: slug, status }).catch(() => {});
	}

	async function sync(event: SubmitEvent) {
		event.preventDefault();
		syncMsg = "";
		try {
			const res = await postJson<{ key: string; progress: Record<string, Status> }>("/api/optout", { key, email: syncEmail, progress });
			key = res.key;
			setAccountKey(res.key);
			progress = { ...progress, ...res.progress };
			localStorage.setItem(LS, JSON.stringify(progress));
			syncMsg = "Synced. Enter the same email on another device to load this checklist.";
		} catch (err) {
			syncMsg = (err as Error).message;
		}
	}

	const done = $derived(data.brokers.filter((b) => progress[b.slug] === "removed").length);
	const requested = $derived(data.brokers.filter((b) => progress[b.slug] === "requested").length);

	// ---- Deletion email generator (runs only in your browser) ----
	const LAWS: Record<string, { label: string; cite: string }> = {
		CA: { label: "California (CCPA/CPRA)", cite: "the California Consumer Privacy Act, as amended by the California Privacy Rights Act (Cal. Civ. Code §§ 1798.105 and 1798.120)" },
		VA: { label: "Virginia (VCDPA)", cite: "the Virginia Consumer Data Protection Act (Va. Code § 59.1-577)" },
		CO: { label: "Colorado (CPA)", cite: "the Colorado Privacy Act (C.R.S. § 6-1-1306)" },
		TX: { label: "Texas (TDPSA)", cite: "the Texas Data Privacy and Security Act (Tex. Bus. & Com. Code § 541.051)" },
		CT: { label: "Connecticut (CTDPA)", cite: "the Connecticut Data Privacy Act (Conn. Gen. Stat. § 42-518)" },
		US: { label: "Other state / general request", cite: "your privacy policy and any privacy law that applies to my information" }
	};
	let law = $state("CA");
	let fullName = $state("");
	let phones = $state("");
	let emails = $state("");
	let address = $state("");
	let to = $state("");
	let copied = $state(false);

	const subject = $derived(`Request to delete my personal information and opt out of sale/sharing${law !== "US" ? ` (${LAWS[law].label})` : ""}`);
	const body = $derived(
		`To the privacy team:

I am making a request under ${LAWS[law].cite}.

Please:
1. Delete all personal information you hold about me, including any people-search or marketing profiles.
2. Stop selling or sharing my personal information, and opt me out of targeted advertising and profiling.
3. Tell any service providers or third parties you sold or shared my information with to delete it too.
4. Confirm in writing when this is done.${law !== "US" ? "\n\nThe law generally requires a response within 45 days." : ""}

Information to help you find my records (use it only to process this request):
Name: ${fullName || "[your full name]"}
Phone number(s): ${phones || "[your phone numbers]"}
Email address(es): ${emails || "[your email addresses]"}
${address ? `Address: ${address}\n` : ""}
Thank you,
${fullName || "[your full name]"}`
	);
	const mailto = $derived(`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
	async function copyLetter() {
		await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
		copied = true;
		setTimeout(() => (copied = false), 2500);
	}
	const brokerEmails = $derived(data.brokers.filter((b) => b.email));

	const steps = [
		{ name: "Register with the free national lists", text: "Add your number to DoNotCall.gov, opt out of prescreened offers at OptOutPrescreen.com, and (in California) file one DROP request." },
		{ name: "Remove people-search listings", text: "Open each broker’s official opt-out page, find your listing, and confirm the removal email. Mark each one Requested, then Removed." },
		{ name: "Send privacy deletion emails", text: "Generate a deletion request citing your state privacy law and send it from your own email to companies that hold your data." },
		{ name: "Re-check every 3 months", text: "Brokers often re-list people from new data. Search yourself again and repeat any that came back." }
	];
	const faqs = [
		{ q: "Why do data brokers cause spam calls and emails?", a: "People-search and marketing-data companies sell phone numbers and emails tied to your name. Telemarketers and scammers buy or scrape those lists. Removing your listings cuts off one of the main sources of new spam." },
		{ q: "Is it free to remove myself from data brokers?", a: "Yes. Every opt-out page listed here is free. Paid services such as DeleteMe or Incogni do the same requests for you on a schedule. DMAchoice (junk mail) is the one registry here that charges a small fee: $8 online for 10 years." },
		{ q: "What is California DROP?", a: "The Delete Request and Opt-out Platform run by the California Privacy Protection Agency. California residents can send one free deletion request to every registered data broker. Since August 1, 2026, brokers must process the DROP list at least every 45 days." },
		{ q: "Does NoSpamCalls send these requests for me?", a: "No. The deletion email is generated in your browser and sent from your own email, so you stay in control. We do not act as your authorized agent and do not store the personal details you type into the generator." }
	];
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		webAppJsonLd({ origin: data.origin, path: "/opt-out", name: "NoSpamCalls data-broker opt-out center", description }),
		howToJsonLd({ name: "How to remove your phone number and email from data brokers for free", description, steps }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<h1>Free data-broker opt-out center</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		Spam calls and emails start with data brokers that sell your number and address. Remove yourself from the
		{data.brokers.length} companies below using their own free opt-out pages, send a state privacy-law deletion email from
		your own inbox, and register with the free national opt-out lists. Track every step here.
	</p>
</div>

<section>
	<h2>Free national and state opt-out lists</h2>
	<div class="tool-grid">
		{#each data.registries as r}
			<div class="tool-card">
				<h3><a href={r.url} rel="noopener noreferrer" target="_blank">{r.name}</a></h3>
				<p>{r.note}</p>
			</div>
		{/each}
	</div>
</section>

<section>
	<h2>Broker removal tracker</h2>
	<p><strong>{done}</strong> removed · <strong>{requested}</strong> requested · {data.brokers.length - done - requested} to do. Opt-out pages checked {data.checked}.</p>
	<div class="table-wrap">
		<table class="data-table">
			<thead><tr><th>Company</th><th>How to opt out</th><th>Status</th></tr></thead>
			<tbody>
				{#each data.brokers as b}
					<tr>
						<td>
							<a href={b.optOutUrl} rel="noopener noreferrer" target="_blank"><strong>{b.name}</strong></a>
							{#if b.covers}<br /><span class="muted">Covers {b.covers}</span>{/if}
							{#if b.email}<br /><span class="muted">{b.email}</span>{/if}
						</td>
						<td>{b.steps}</td>
						<td>
							<select value={progress[b.slug] ?? "todo"} onchange={(e) => setStatus(b.slug, (e.currentTarget as HTMLSelectElement).value as Status)} aria-label={`Status for ${b.name}`}>
								<option value="todo">To do</option>
								<option value="requested">Requested</option>
								<option value="removed">Removed</option>
							</select>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="muted">Progress saves in this browser automatically. Note: Radaris.com and PeekYou.com currently show court-order domain-transfer notices, so they are not listed.</p>
	<form class="tool-form tool-card" onsubmit={sync} style="max-width: 32rem">
		<label><span>Sync this checklist across devices (optional email)</span><input type="email" bind:value={syncEmail} required autocomplete="email" /></label>
		<button class="btn" type="submit">Sync my progress</button>
		{#if syncMsg}<p class="muted">{syncMsg}</p>{/if}
	</form>
</section>

<section id="deletion-email">
	<h2>State privacy deletion email generator</h2>
	<p class="muted">Everything you type here stays in your browser — it is not sent to NoSpamCalls. You send the email yourself.</p>
	<div class="hero-grid">
		<form class="tool-form tool-card" onsubmit={(e) => e.preventDefault()}>
			<label>
				<span>Your state law</span>
				<select bind:value={law}>
					{#each Object.entries(LAWS) as [code, l]}<option value={code}>{l.label}</option>{/each}
				</select>
			</label>
			<label><span>Full name</span><input type="text" bind:value={fullName} autocomplete="name" /></label>
			<label><span>Phone number(s)</span><input type="text" bind:value={phones} /></label>
			<label><span>Email address(es)</span><input type="text" bind:value={emails} /></label>
			<label><span>Mailing address (optional)</span><input type="text" bind:value={address} /></label>
			<label>
				<span>Send to (company privacy email)</span>
				<input type="email" bind:value={to} list="broker-emails" placeholder="privacy@company.com" />
				<datalist id="broker-emails">{#each brokerEmails as b}<option value={b.email}>{b.name}</option>{/each}</datalist>
			</label>
		</form>
		<div>
			<pre class="letter">Subject: {subject}

{body}</pre>
			<div class="btn-row">
				<a class="btn" href={mailto}>Open in my email app</a>
				<button class="btn secondary" type="button" onclick={copyLetter}>{copied ? "Copied" : "Copy text"}</button>
			</div>
			<p class="muted">Find a company’s privacy email in its privacy policy (look for “Your privacy rights” or “Do Not Sell”). Not legal advice.</p>
		</div>
	</div>
</section>

<Faq {faqs} />
<p>Related: <a href="/stop-spam-calls">how to stop spam calls</a> · <a href="/email-shield">email spam shield</a> · <a href="/blocklist">block a number</a></p>
