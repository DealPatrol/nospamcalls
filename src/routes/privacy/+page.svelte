<script lang="ts">
	import { SITE_NAME } from '#lib/site';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const canonical = $derived(`${data.origin}/privacy`);
</script>

<svelte:head>
	<title>Privacy policy — {SITE_NAME}</title>
	<meta name="description" content="How NoSpamCalls collects, uses, and stores information." />
	<link rel="canonical" href={canonical} />
</svelte:head>

<article class="prose">
	<h1>Privacy policy</h1>
	<p class="muted">Last updated: November 20, 2026</p>
	<p>
		NoSpamCalls is a free website for looking up and reporting phone numbers and for publishing practical
		guides. This policy explains what we collect and why. It is not legal advice.
	</p>

	<h2>Information we collect</h2>
	<ul>
		<li>
			<strong>Reports you submit:</strong> the phone number, the category you chose, an optional comment,
			and the time of the report. Comments are published on the lookup page. Do not include names, account
			numbers, addresses, or other personal information in a comment.
		</li>
		<li>
			<strong>Waitlist emails:</strong> if you join the app or business waitlist, we store your email and
			which list you joined.
		</li>
		<li>
			<strong>Security logs:</strong> we store a one-way hash of your IP address, not the raw IP, to limit
			spam and abuse. The hash is not intended to identify you.
		</li>
		<li>
			<strong>Basic server logs:</strong> our hosting provider may log technical data such as request
			paths, user-agent strings, and approximate location as part of running the website.
		</li>
	</ul>

	<h2>What we do not do today</h2>
	<p>
		We do not run a third-party advertising network on this site. Placeholder “advertisement” areas may
		appear, but they are empty. We do not sell your waitlist email. We do not use your reports to place
		telemarketing calls.
	</p>

	<h2>How long we keep data</h2>
	<p>
		Public reports stay up unless we remove them for abuse, legal reasons, or a valid request. Waitlist
		emails are kept until the product launches or you ask to be removed. Rate-limit records are used only
		for abuse prevention.
	</p>

	<h2>Cookies and accounts</h2>
	<p>This site does not require an account. We do not use advertising cookies.</p>

	<h2>Children</h2>
	<p>The site is not directed at children under 13, and we do not knowingly collect their information.</p>

	<h2>Contact</h2>
	<p>
		For privacy questions or to ask us to remove a waitlist email, use the contact method published on
		this site when one is available, or do not submit additional personal information until one is.
	</p>
</article>
