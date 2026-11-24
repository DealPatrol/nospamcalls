<script lang="ts">
	import SeoHead from "#lib/components/SeoHead.svelte";
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import ProWaitlist from "#lib/components/ProWaitlist.svelte";
	import Faq from "#lib/components/Faq.svelte";
	import { FREE_TODAY, PRO_FEATURES } from "#lib/content/pro";
	import { breadcrumbJsonLd, faqJsonLd, type Crumb } from "#lib/seo";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/app", label: "NoSpamCalls Pro early access" }
	];
	const title = "NoSpamCalls Pro early access — automated spam call screening (free waitlist)";
	const description =
		"Join the free NoSpamCalls Pro early-access list and vote for automatic live call screening, done-for-you data-broker removal, automated TCPA cash recovery, and family scam protection. Not launched; nothing to pay.";
	const canonical = $derived(`${data.origin}/app`);
	const faqs = [
		{ q: "Is NoSpamCalls Pro available now?", a: "No. Pro is in development. It has no price yet and joining the early-access list never charges you. Everything on the website today is free." },
		{ q: "What will Pro do that the free tools don’t?", a: "The free tools are do-it-yourself: you download the blocklist, send opt-out requests, and log calls yourself. Pro is planned to do those jobs automatically — screening unknown callers, blocking slipped-through numbers, re-running data-broker removals, and matching your calls to open settlements." },
		{ q: "Why vote for features?", a: "Your votes decide what we build first. Early-access members hear about it first and can try it before anyone else." }
	];
</script>

<SeoHead {title} {description} {canonical} jsonLd={[breadcrumbJsonLd(data.origin, crumbs), faqJsonLd(faqs)]} />
<Breadcrumbs {crumbs} />

<h1>NoSpamCalls Pro — free early access</h1>
<div class="answer-box">
	<p class="answer-label">In short</p>
	<p>
		NoSpamCalls is free today. Pro will be the automated, hands-off version: it screens unknown callers for you, removes you
		from data brokers every month, and turns illegal robocalls into claims without the paperwork. It is not launched and has
		no price. Join the free list and tell us which features matter most.
	</p>
</div>

<ProWaitlist heading="Join free early access & vote" />

<div class="hero-grid">
	<section class="tool-card">
		<h2>Free today</h2>
		<ul>{#each FREE_TODAY as f}<li><a href={f.href}><strong>{f.label}</strong></a> — {f.text}</li>{/each}</ul>
	</section>
	<section class="tool-card">
		<h2>Coming in Pro</h2>
		<ul>{#each PRO_FEATURES as f}<li><strong>{f.label}</strong> — {f.text}</li>{/each}</ul>
	</section>
</div>

<Faq {faqs} />
<p>Compare options: <a href="/compare">best free &amp; paid spam blockers</a> · <a href="/spam-call-data">live spam call data</a></p>
