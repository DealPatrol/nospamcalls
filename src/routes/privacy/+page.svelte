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
	<p class="muted">Last updated: November 23, 2026</p>
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
			<strong>Optional plan emails:</strong> if you leave an email after the spam-protection checkup or a
			similar offer, we store your email, the type of request, the page you were on, and, if you finished
			the checkup, your score and answers so we can send you that plan later.
		</li>
		<li>
			<strong>Number-alert emails:</strong> if you ask to be notified when a number is reported again, we
			store your email and that phone number.
		</li>
		<li>
			<strong>Business check requests:</strong> if you request a Scam Likely check, we store your email,
			business or organization name, the phone number you submitted, optional notes, and we add the email
			to the business waitlist.
		</li>
		<li>
			<strong>Security logs:</strong> we store a one-way hash of your IP address, not the raw IP, to limit
			spam and abuse. The hash is not intended to identify you.
		</li>
		<li>
			<strong>Anonymous action counts:</strong> we store aggregate counts of actions such as waitlist
			signups, reports, checkup emails, number-alert requests, and business checks (event name, page path,
			and date). These counts are not tied to your email or IP address.
		</li>
		<li>
			<strong>Basic server logs:</strong> our hosting provider may log technical data such as request
			paths, user-agent strings, and approximate location as part of running the website.
		</li>
	</ul>

	<h2>What we do not do today</h2>
	<p>
		We do not run a third-party advertising network on this site. Placeholder “advertisement” areas may
		appear, but they are empty. We do not sell your email. We do not use your reports to place
		telemarketing calls. We are not currently sending email; addresses are stored so we can contact you
		later if an email service is connected and you asked for that update. We did not enable Vercel Web
		Analytics on this project because it can incur usage charges on a Pro plan.
	</p>

	<h2>How long we keep data</h2>
	<p>
		Public reports stay up unless we remove them for abuse, legal reasons, or a valid request. Waitlist,
		plan, number-alert, and business-check emails are kept until they are used for the request you made,
		the related product launches, or you ask to be removed. Rate-limit records and anonymous action counts
		are used only for abuse prevention and to understand which forms people complete.
	</p>

	<h2>Cookies and accounts</h2>
	<p>This site does not require an account. We do not use advertising cookies.</p>

	<h2>Children</h2>
	<p>The site is not directed at children under 13, and we do not knowingly collect their information.</p>

	<h2>Contact</h2>
	<p>
		For privacy questions or to ask us to remove an email we stored (waitlist, plan, number alert, or
		business check), use the contact method published on this site when one is available, or do not submit
		additional personal information until one is.
	</p>
</article>
