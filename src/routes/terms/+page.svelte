<script lang="ts">
	import { SITE_NAME } from '#lib/site';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const canonical = $derived(`${data.origin}/terms`);
</script>

<svelte:head>
	<title>Terms of use — {SITE_NAME}</title>
	<meta name="description" content="Terms of use for the NoSpamCalls website, including user-generated content and legal disclaimers." />
	<link rel="canonical" href={canonical} />
</svelte:head>

<article class="prose">
	<h1>Terms of use</h1>
	<p class="muted">Last updated: November 26, 2026</p>

	<h2>Not legal advice</h2>
	<p>
		NoSpamCalls provides information and a community reporting tool. Nothing on this site is legal advice,
		a lawyer referral, or a promise about your rights under the Telephone Consumer Protection Act, state
		law, or any other law. If you need legal help, consult a licensed attorney in your state.
	</p>

	<h2>No guarantees</h2>
	<p>
		We do not guarantee that reporting a number, registering on a do-not-call list, opting out of
		data-broker listings, or following any guide on this site will stop calls, identify a caller, remove
		a “Scam Likely” label, or lead to a successful complaint or lawsuit. Many illegal calls use spoofed
		or rotating numbers.
	</p>

	<h2>User-generated content</h2>
	<p>
		Reports and comments are submitted by users. They are opinions, not statements by NoSpamCalls, and they
		may be wrong, incomplete, or outdated. You are responsible for what you submit. Do not post defamatory,
		unlawful, or private information. We may remove, edit, or decline content for any reason, including
		abuse and suspected spam, and we may rate-limit submissions.
	</p>
	<p>
		By submitting a report or comment, you grant NoSpamCalls a non-exclusive, worldwide license to display
		and use that content on the site and in related indexes, such as a sitemap.
	</p>

	<h2>Acceptable use</h2>
	<p>
		You may not use the site to harass anyone, scrape it in a way that overloads the service, submit
		automated junk, or attempt to break security or rate limits.
	</p>

	<h2 id="ios-subscriptions">iPhone app and subscriptions</h2>
	<p>
		The NoSpamCalls: Spam Call Blocker iPhone app is licensed to you under Apple’s
		<a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" rel="noopener">Standard End User License
		Agreement</a> together with these terms. Core blocking tools are free. NoSpamCalls Pro is an optional auto-renewing
		subscription (monthly or yearly) purchased through your Apple ID. If a free trial is offered, it converts to a paid
		subscription at the end of the trial unless you cancel at least 24 hours before it ends. Payment is charged to your
		Apple ID at confirmation of purchase, and the subscription renews automatically unless auto-renew is turned off at
		least 24 hours before the end of the current period. You can manage or cancel it any time in Settings &gt; your
		name &gt; Subscriptions. Refunds are handled by Apple under its policies. Call and text filtering depend on iOS
		features and public complaint data, and we cannot guarantee that every unwanted call or text is blocked or that no
		wanted call or text is filtered.
	</p>

	<h2>Disclaimer of warranties and limitation of liability</h2>
	<p>
		The site is provided “as is.” To the fullest extent allowed by law, we disclaim warranties of
		accuracy, merchantability, and fitness for a particular purpose, and we are not liable for lost
		profits, lost data, or indirect damages arising from your use of the site.
	</p>

	<h2>Changes</h2>
	<p>We may update these terms from time to time. Continued use of the site after a change means you accept the revised terms.</p>
</article>
