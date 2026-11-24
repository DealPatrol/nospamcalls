<script lang="ts">
	import SearchForm from "#lib/components/SearchForm.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import QuickBlock from "#lib/components/QuickBlock.svelte";
	import EmailCaptureBar from "#lib/components/EmailCaptureBar.svelte";
	import ProWaitlist from "#lib/components/ProWaitlist.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import { FREE_TODAY, PRO_FEATURES } from "#lib/content/pro";
	import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "#lib/seo";
	import { formatNational, e164ToSlug } from "#lib/phone";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const title = "NoSpamCalls: Stop Spam Calls & Claim Cash From Illegal Robocalls — Free";
	const description =
		"Free spam number lookup backed by FTC and FCC complaints, a Top-100 spammer blocklist (.vcf), verified open TCPA settlements, a demand-letter kit, data-broker opt-outs, and Gmail spam filters.";
	const canonical = $derived(`${data.origin}/`);
	const nf = (n: number) => n.toLocaleString("en-US");

	const faqs = [
		{
			q: "How do I stop spam calls for free?",
			a: "Turn on your phone’s built-in screening (Screen Unknown Callers → Ask Reason for Calling on iOS 26, Call Screen on Android), turn on your carrier’s free spam filter, register on DoNotCall.gov, and block repeat callers. NoSpamCalls adds a free Top-100 spammer blocklist you can import as one contact and block in a single tap."
		},
		{
			q: "Is NoSpamCalls free?",
			a: "Yes. The lookup, blocklist, Get Paid tools, data-broker opt-out kit, email shield, and phone setup wizard are free. Downloads and printables ask for your email once. NoSpamCalls Pro — automated call screening, done-for-you data-broker removal, and automated TCPA recovery — is not launched, has no price yet, and you can join the free early-access list."
		},
		{
			q: "Can I get money from robocallers?",
			a: "Sometimes. Under the Telephone Consumer Protection Act (47 U.S.C. § 227), illegal robocalls and repeated calls to numbers on the Do Not Call list can carry statutory damages of $500 per violation, up to $1,500 if willful. Those are legal maximums, not guaranteed recoveries. NoSpamCalls lists verified open class-action settlements and gives you a free evidence log and demand-letter template. It is not a law firm."
		},
		{
			q: "Where does the spam number data come from?",
			a: "From the FCC Consumer Complaints open dataset (unwanted calls) and the FTC Do Not Call Reported Calls Data API, refreshed daily, plus community reports on this site. Caller ID can be spoofed, so a listed number may not belong to the company that called."
		}
	];
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	type="website"
	jsonLd={[websiteJsonLd(data.origin), organizationJsonLd(data.origin), faqJsonLd(faqs)]}
/>

<section class="hero">
	<h1>Stop Spam Calls &amp; Claim Cash From Illegal Robocalls — Free</h1>
	<p class="lede">
		Look up any number against {data.gov.numbers ? nf(data.gov.numbers) : "thousands of"} numbers from FTC and FCC complaints, block
		the worst offenders in one tap, and see which verified TCPA settlements you can claim.
	</p>
	<div class="hero-grid">
		<EmailCaptureBar
			headline="Get the free Top-100 Active Spammers blocklist"
			sub="Get the free Top-100 Active Spammers blocklist (.vcf), weekly scam alerts, and instant alerts when new $500–$1,500 TCPA settlements open."
			leadMagnet="home_blocklist"
			button="Send my free blocklist"
			unlockedText="Your blocklist is ready."
		>
			<div class="btn-row">
				<a class="btn" href="/api/blocklist.vcf?includeTop=1" download="nospamcalls-blocklist.vcf">Download Top-100 blocklist (.vcf)</a>
				<a class="btn secondary" href="/blocklist">How to import &amp; block it</a>
			</div>
		</EmailCaptureBar>
		<div class="tool-card" id="lookup">
			<h2>Who called me? Free lookup</h2>
			<SearchForm />
			{#if data.gov.numbers}
				<p class="muted">
					{nf(data.gov.numbers)} numbers from {nf(data.gov.complaints)} FTC and FCC complaints, refreshed daily.
					<a href="/spam-call-data">See the live data index</a>.
				</p>
			{/if}
		</div>
	</div>
</section>

<QuickBlock heading="A spam call got through? Block it so it won’t again" />

<section id="free-vs-pro">
	<h2>What’s free today vs. coming in NoSpamCalls Pro</h2>
	<div class="hero-grid">
		<div class="tool-card">
			<p class="answer-label">Free now</p>
			<ul>
				{#each FREE_TODAY as f}
					<li><a href={f.href}><strong>{f.label}</strong></a> — {f.text}</li>
				{/each}
			</ul>
		</div>
		<div class="tool-card">
			<p class="answer-label">Pro · coming soon (no price yet, nothing charged)</p>
			<ul>
				{#each PRO_FEATURES as f}<li><strong>{f.label}</strong> — {f.text}</li>{/each}
			</ul>
		</div>
	</div>
	<ProWaitlist />
</section>

<section>
	<h2>Get paid from spam companies</h2>
	<p>Illegal robocalls and repeat Do Not Call violations can be worth real money. There are four legal ways to go after it:</p>
	<div class="tool-grid">
		<div class="tool-card"><h3>Open class-action claims</h3><p>Court-approved TCPA settlements you can claim from today, each verified on its official site.</p></div>
		<div class="tool-card"><h3>$500–$1,500 evidence kit</h3><p>Log each illegal call, then print a TCPA evidence packet and a self-help demand letter.</p></div>
		<div class="tool-card"><h3>Debt-collector violations</h3><p>The FDCPA allows up to $1,000 in statutory damages per lawsuit against abusive collectors.</p></div>
		<div class="tool-card"><h3>$0-upfront lawyers</h3><p>Consumer attorneys often take strong TCPA cases on contingency. We take no fee or referral cut.</p></div>
	</div>
	<p><a class="btn" href="/get-paid">See open settlements &amp; the free kit</a></p>
	<p class="muted">Educational self-help only. NoSpamCalls is not a law firm and does not give legal advice.</p>
</section>

<section>
	<h2>Free call &amp; email blocking tools</h2>
	<div class="tool-grid">
		<a class="tool-card" href="/blocklist"><h3>Spam lookup &amp; .vcf blocklist</h3><p>Your personal blocklist plus the top active FTC/FCC numbers in one importable contact.</p></a>
		<a class="tool-card" href="/opt-out"><h3>Data-broker opt-out kit</h3><p>Remove your number and email from 14 people-search and marketing-data companies, with a privacy-law email generator.</p></a>
		<a class="tool-card" href="/email-shield"><h3>Email spam shield</h3><p>Trace who really sent a spam email, draft an abuse report, and export Gmail filters — no Gmail login.</p></a>
		<a class="tool-card" href="/setup"><h3>Phone &amp; carrier setup</h3><p>Exact steps for iPhone, Android, Verizon, AT&amp;T, and T-Mobile spam blocking and call forwarding.</p></a>
		<a class="tool-card" href="/spam-call-data"><h3>Live spam call data index</h3><p>Most-reported numbers, caller area codes, and complaint topics from FTC and FCC data.</p></a>
		<a class="tool-card" href="/compare"><h3>Spam blocker comparison</h3><p>Free vs. paid call blockers, data-broker removers, and email tools, with verified prices.</p></a>
	</div>
</section>

{#if data.active.length}
	<section>
		<h2>Most-reported numbers this week</h2>
		<ul class="guide-index">
			{#each data.active as n}
				<li>
					<a href={`/number/${e164ToSlug(n.e164)}`}>{formatNational(n.e164)}</a>
					— {n.total_gov_count} federal complaint{n.total_gov_count === 1 ? "" : "s"}{n.top_subject ? ` · ${n.top_subject}` : ""}
				</li>
			{/each}
		</ul>
		<p><a href="/spam-call-data">See the full live index →</a></p>
	</section>
{/if}

<Faq {faqs} />

<section>
	<h2>Guides and directories</h2>
	<div class="grid-2">
		<article class="card"><h3><a href="/protect">Free spam-protection checkup</a></h3><p>Six questions, a printable plan.</p></article>
		<article class="card"><h3><a href="/stop-spam-calls">How to stop spam calls</a></h3><p>Do Not Call, state lists, carrier tools, and data brokers.</p></article>
		<article class="card"><h3><a href="/block-spam-calls">Block spam calls</a></h3><p>iPhone, Android, AT&amp;T, Verizon, and T-Mobile guides.</p></article>
		<article class="card"><h3><a href="/scams">Phone and text scam guides</a></h3><p>IRS, Social Security, car warranty, toll texts, one-ring calls, and more.</p></article>
		<article class="card"><h3><a href="/report-spam-calls">Report spam to the FTC and FCC</a></h3><p>Where and how to file official complaints.</p></article>
		<article class="card"><h3><a href="/tcpa-rights">Your TCPA rights</a></h3><p>What the Telephone Consumer Protection Act covers.</p></article>
		<article class="card"><h3><a href="/scam-likely">What “Scam Likely” means</a></h3><p>Carrier warning labels explained, plus a <a href="/business">free business check</a>.</p></article>
		<article class="card"><h3><a href="/area-code">U.S. area-code directory</a></h3><p>Official facts for every in-service area code.</p></article>
		<article class="card"><h3><a href="/spam-call-data">Live spam call data index</a></h3><p>Top reported numbers, area codes, and topics from federal complaints.</p></article>
		<article class="card"><h3><a href="/compare">Best spam blockers compared</a></h3><p>Honest free vs. paid comparison with verified prices.</p></article>
		<article class="card"><h3><a href="/report">Report a number</a></h3><p>Add a community report so the next person is warned.</p></article>
		<article class="card"><h3><a href="/app">NoSpamCalls Pro early access</a></h3><p>Vote for the automated features you want. Free to join.</p></article>
	</div>
</section>
