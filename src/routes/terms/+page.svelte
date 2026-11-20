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
	<p class="muted">Last updated: November 20, 2026</p>

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

	<h2>Disclaimer of warranties and limitation of liability</h2>
	<p>
		The site is provided “as is.” To the fullest extent allowed by law, we disclaim warranties of
		accuracy, merchantability, and fitness for a particular purpose, and we are not liable for lost
		profits, lost data, or indirect damages arising from your use of the site.
	</p>

	<h2>Changes</h2>
	<p>We may update these terms from time to time. Continued use of the site after a change means you accept the revised terms.</p>
</article>
