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
	<p class="muted">Last updated: November 26, 2026</p>
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
			<strong>Personal blocklist (optional):</strong> when you add a number on Block a Number, we store that phone number, the
			call type, and any company name or note you typed, linked to a random workspace key saved in your browser. Adding a
			number also files a community report for it (your note is published only if it passes our comment rules). Your email is never
			used as the key, so nobody can open your list by knowing your email address.
		</li>
		<li>
			<strong>TCPA evidence log (optional):</strong> the calls and texts you log on Get Paid (number, date and time, company
			details, checkboxes, and notes) are stored under the same workspace key so you can print your packet later. They are not
			published and are never sent to any company or lawyer. The demand-letter fields (your name, address, and the company’s
			address) stay in your browser and are not sent to us.
		</li>
		<li>
			<strong>Opt-out progress (optional):</strong> the status you choose for each data broker is saved in your browser and,
			under your workspace key, in our database. The privacy deletion email generator runs only in your browser; the personal
			details you type into it are not sent to us.
		</li>
		<li>
			<strong>Email header analyzer:</strong> raw email headers or domains you submit to <code>/api/email-analyze</code> are
			parsed in memory to answer your request and are never stored in our database or logs. To answer, our server looks up
			public DNS records and queries public RDAP registries about the sending IP address.
		</li>
		<li>
			<strong>Free sign-ups, downloads, and alerts:</strong> when you enter your email to unlock a download or printable, get
			scam or settlement alerts, follow a number or area code, get a re-check reminder, or join the NoSpamCalls Pro early-access
			list, we store your email, the page you were on, which offer you chose, the number, area code, or guide it was about (if
			any), and any Pro features you ticked. This is kept separately from your blocklist, evidence log, and opt-out progress and
			is never linked to them. We set <code>nsc_unlocked=1</code> in a cookie and in local storage, and keep your email in this
			browser’s local storage, so you are not asked again. Nothing is charged.
		</li>
		<li>
			<strong>Security logs:</strong> we store a one-way hash of your IP address, not the raw IP, to limit
			spam and abuse. The hash is not intended to identify you.
		</li>
		<li>
			<strong>Anonymous action counts:</strong> we store aggregate counts of actions such as sign-ups by
			page and offer, Pro feature votes, reports, checkup emails, number-alert requests, and business checks (event name, page path,
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
		telemarketing calls. We only email you about what you signed up for, and every email will include a
		way to unsubscribe. We did not enable Vercel Web
		Analytics on this project because it can incur usage charges on a Pro plan.
	</p>

	<h2>How long we keep data</h2>
	<p>
		Public reports stay up unless we remove them for abuse, legal reasons, or a valid request. Your blocklist, evidence log,
		and opt-out progress stay until you delete entries in the tool or ask us to remove them. Sign-up, alert,
		waitlist, and business-check emails are kept until you unsubscribe or ask to be removed. Rate-limit records and anonymous action counts
		are used only for abuse prevention and to understand which forms people complete.
	</p>

	<h2>Cookies, browser storage, and accounts</h2>
	<p>
		This site does not require an account. We do not use advertising cookies. The free tools save a random workspace key and
		your checklist progress in your browser’s local storage so your list is there when you come back. That random key is the
		only way to open your blocklist, evidence log, or opt-out progress; clearing your browser storage removes it. After you
		unlock downloads, a first-party <code>nsc_unlocked</code> cookie and your email are stored in this browser only so we
		don’t ask again.
	</p>

	<h2>Public government data</h2>
	<p>
		Number pages show counts from the FCC Consumer Complaints open dataset and the FTC Do Not Call Reported Calls Data API.
		We store only the reported caller numbers, complaint counts, dates, topics, and a sample city and state — not the names
		or contact details of the people who complained.
	</p>

	<h2 id="ios-app">NoSpamCalls iPhone app</h2>
	<p>
		The NoSpamCalls: Robocall Blocker iPhone app is built to work without an account. Apart from the optional burner
		number described below, nothing you enter in it is sent to us.
	</p>
	<ul>
		<li>
			<strong>Stays on your iPhone:</strong> your personal blocklist, blocked prefixes, custom text rules, exposure
			checklist, opt-out progress, TCPA evidence log, family checklist, and settings. Saved passwords are stored in the
			iOS Keychain on your device and can be protected with Face ID.
		</li>
		<li>
			<strong>Spam-number updates:</strong> the app downloads the public list at <code>/api/call-directory.json</code>.
			That request contains no personal information beyond what any web request includes (such as IP address and
			user-agent, which our host may log).
		</li>
		<li>
			<strong>Call blocking:</strong> iOS gives the app’s Call Directory extension a list of numbers to block. The app
			never sees your call history, contacts, or who calls you.
		</li>
		<li>
			<strong>Text filtering:</strong> iOS asks the app’s message filter to sort texts from unknown senders. It runs only
			on your device; the app does not receive, store, or send message content, and iOS never shows it iMessages or
			texts from your contacts.
		</li>
		<li>
			<strong>Password breach check:</strong> the app sends only the first 5 characters of a SHA-1 hash of the password to
			the free Pwned Passwords service (api.pwnedpasswords.com) and compares the results on your device. Your password
			never leaves your iPhone.
		</li>
		<li>
			<strong>Burner number (optional, Pro + Burner only):</strong> if you turn on a burner number, the app sends us a
			random install ID, the area code you pick, the phone number you want burner calls forwarded to, your call-handling
			choice (forward or voicemail), and your App Store subscription transaction so we can confirm the subscription. We
			buy and operate the number through our telephone carrier, Twilio. Calls and texts to the burner number are
			processed by Twilio: calls are forwarded to your number or recorded as voicemail, and we store texts received
			(sender number and message), voicemail recordings (caller number, length, and audio), and monthly call minutes so
			the app can show them to you. Your main phone line is never forwarded through us. When you burn the number,
			release it, or your Pro + Burner subscription ends (after a 3-day grace period), we release the number and delete
			its stored texts, voicemails, recordings, and forwarding number. We do not sell this data or use it for advertising.
		</li>
		<li>
			<strong>Purchases:</strong> subscriptions are processed by Apple. We do not receive your payment details.
		</li>
		<li><strong>No tracking:</strong> the app has no ads, analytics, or tracking SDKs.</li>
	</ul>
	<p>Deleting the app, or using “Erase all data” in its settings, removes everything it stored on your device.</p>

	<h2>Children</h2>
	<p>The site is not directed at children under 13, and we do not knowingly collect their information.</p>

	<h2>Contact</h2>
	<p>
		For privacy questions or to ask us to remove an email we stored (sign-up, alert, Pro early access,
		waitlist, or business check), email <a href="mailto:info@nospamcalls.org">info@nospamcalls.org</a>.
	</p>
</article>
