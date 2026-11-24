<script lang="ts">
	import SearchForm from "#lib/components/SearchForm.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import QuickBlock from "#lib/components/QuickBlock.svelte";
	import EmailSignup from "#lib/components/EmailSignup.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "#lib/seo";
	import { formatNational, e164ToSlug } from "#lib/phone";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const title = "NoSpamCalls — One simple price. Stop spam calls for good.";
	const description =
		"Block a spam number in one tap, download a free .vcf blocklist built from FTC and FCC complaints, turn illegal robocalls into TCPA claims, and remove your number from data brokers.";
	const canonical = $derived(`${data.origin}/`);

	const faqs = [
		{
			q: "How does NoSpamCalls stop spam calls?",
			a: "Enter any number that got through and it goes on your personal blocklist immediately. Download the blocklist as one .vcf contact, import it, and block that contact on your iPhone or Android. The free list also includes the most-reported numbers in recent FTC Do Not Call and FCC unwanted-call complaints. Live carrier call screening is being added next."
		},
		{
			q: "How much does it cost?",
			a: "The web tools — lookup, personal blocklist, .vcf download, Get Paid tools, data-broker opt-out center, email shield, and phone setup wizard — are free. The planned flat plan with live call screening is a $9/month founding rate, and nothing is charged today."
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
	<h1>One simple price. Stop spam calls for good.</h1>
	<p class="lede">
		If a spam call ever gets through, enter the number and we add it to your blocklist so it won’t get through
		again — plus turn illegal robocalls into cash claims.
	</p>
	<div class="hero-grid">
		<QuickBlock heading="A spam call got through?" />
		<div class="tool-card">
			<p class="answer-label">One plan. No tiers.</p>
			<h2>Founding Member</h2>
			<p class="price">$9<small>/mo flat, once live call screening launches</small></p>
			<p><strong>$0 charged today.</strong> Join with your email to lock in the founding rate. We will email the exact price before any charge, and you can say no.</p>
			<ul>
				<li>Live now, free: blocklist + .vcf, Get Paid tools, data-broker opt-outs, email shield, phone setup</li>
				<li>Coming in the plan: live carrier call screening that checks every number on your list</li>
			</ul>
			<EmailSignup kind="founding_plan" button="Join — $0 today" success="You’re in. Nothing is charged; we’ll email the price before live screening starts." />
		</div>
	</div>
</section>

<section>
	<h2>Get paid from spam companies</h2>
	<p>
		Illegal robocalls and repeat Do Not Call violations can be worth real money. There are four legal ways to go after it:
	</p>
	<div class="tool-grid">
		<div class="tool-card"><h3>Open class-action claims</h3><p>Court-approved TCPA settlements you can claim from today, each verified on its official site.</p></div>
		<div class="tool-card"><h3>$500–$1,500 evidence kit</h3><p>Log each illegal call, then print a TCPA evidence packet and a self-help demand letter.</p></div>
		<div class="tool-card"><h3>Debt-collector violations</h3><p>The FDCPA allows up to $1,000 in statutory damages per lawsuit against abusive collectors.</p></div>
		<div class="tool-card"><h3>$0-upfront lawyers</h3><p>Consumer attorneys often take strong TCPA cases on contingency. We take no fee or referral cut.</p></div>
	</div>
	<p><a class="btn" href="/get-paid">Open the Get Paid tools</a></p>
	<p class="muted">Educational self-help only. NoSpamCalls is not a law firm and does not give legal advice.</p>
</section>

<section>
	<h2>Free call &amp; email blocking tools</h2>
	<div class="tool-grid">
		<a class="tool-card" href="/blocklist"><h3>Spam lookup &amp; .vcf blocklist</h3><p>Your personal blocklist plus the top active FTC/FCC numbers in one importable contact.</p></a>
		<a class="tool-card" href="/opt-out"><h3>Data-broker opt-out center</h3><p>Remove your number and email from 14 people-search and marketing-data companies, with a privacy-law email generator.</p></a>
		<a class="tool-card" href="/email-shield"><h3>Email spam shield</h3><p>Trace who really sent a spam email, draft an abuse report, and export Gmail filters — no Gmail login.</p></a>
		<a class="tool-card" href="/setup"><h3>Phone &amp; carrier setup</h3><p>Exact steps for iPhone, Android, Verizon, AT&amp;T, and T-Mobile spam blocking and call forwarding.</p></a>
	</div>
</section>

<section>
	<h2>Look up a number</h2>
	<SearchForm />
	{#if data.gov.numbers}
		<p class="muted">
			{data.gov.numbers.toLocaleString("en-US")} numbers from {data.gov.complaints.toLocaleString("en-US")} FTC and FCC complaints, refreshed daily.
		</p>
	{/if}
	{#if data.active.length}
		<h3>Most-reported numbers this week</h3>
		<ul class="guide-index">
			{#each data.active as n}
				<li>
					<a href={`/number/${e164ToSlug(n.e164)}`}>{formatNational(n.e164)}</a>
					— {n.total_gov_count} federal complaint{n.total_gov_count === 1 ? "" : "s"}{n.top_subject ? ` · ${n.top_subject}` : ""}
				</li>
			{/each}
		</ul>
	{/if}
</section>

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
		<article class="card"><h3><a href="/report">Report a number</a></h3><p>Add a community report so the next person is warned.</p></article>
		<article class="card"><h3><a href="/app">App waitlist</a></h3><p>Founding-member notice, no payment now.</p></article>
	</div>
</section>
