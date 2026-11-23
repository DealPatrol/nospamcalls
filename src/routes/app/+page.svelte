<script lang="ts">
	import WaitlistForm from "#lib/components/WaitlistForm.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import SocialProof from "#lib/components/SocialProof.svelte";
	import { SITE_NAME } from "#lib/site";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	const title = "App waitlist — founding-member notice, no payment now";
	const description =
		"Join the NoSpamCalls app waitlist. If we charge at launch, waitlist members get founding-member pricing first, with the price emailed before any charge. Nothing to pay today. The website is already free.";
	const canonical = $derived(`${data.origin}/app`);
</script>

<SeoHead {title} {description} {canonical} />

<h1>Get early access if we launch an app</h1>
<p class="lede">
	The website already lets you look up numbers, report callers, and follow official blocking steps for free.
	A consumer app is on the roadmap for call logging, Do Not Call help, and optional screening. It is not in
	the App Store or Google Play yet.
</p>

<div class="answer-box">
	<p class="answer-label">Founding-member promise</p>
	<p>
		If we charge for the app at launch, people on this waitlist will be offered founding-member pricing
		before the public price. We will email the amount and you can decline. We are not collecting a payment
		method now, and joining this list will not charge you.
	</p>
</div>

<SocialProof reports={data.stats.reports} appWaitlist={data.stats.appWaitlist} businessWaitlist={data.stats.businessWaitlist} />

<WaitlistForm type="app" {form} submitLabel="Join the waitlist — no payment now" />

<h2>What you can use today, for free</h2>
<ul>
	<li><a href="/protect">A 2-minute spam-protection checkup</a> with a printable plan</li>
	<li><a href="/block-spam-calls">iPhone, Android, and carrier blocking guides</a></li>
	<li><a href="/">Number lookup</a> and <a href="/report">community reports</a></li>
</ul>
