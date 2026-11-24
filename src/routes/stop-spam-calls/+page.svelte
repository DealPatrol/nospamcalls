<script lang="ts">
	import { SITE_NAME } from '#lib/site';
	import EmailCaptureBar from '#lib/components/EmailCaptureBar.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const title = 'How to stop spam calls — free guide';
	const description =
		'Register on the National Do Not Call list, use carrier and iPhone or Android tools, and opt out of data-broker listings. This is a practical guide, not legal advice.';
	const canonical = $derived(`${data.origin}/stop-spam-calls`);
</script>

<svelte:head>
	<title>{title} — {SITE_NAME}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
</svelte:head>

<article class="prose">
	<h1>How to stop spam calls</h1>
	<p class="lede">
		No tool stops every robocall, especially when scammers spoof a new number each time. These official
		and built-in steps still help, and they are free. This page is general information, not legal advice.
	</p>
	<EmailCaptureBar
		headline="Get our free Top-100 spammer blocklist (.vcf) and weekly scam alerts"
		sub="One email. Unlocks every free download on NoSpamCalls. Unsubscribe anytime."
		leadMagnet="guide_checklist"
		contextValue="stop-spam-calls"
		button="Get it free"
	>
		<p><a class="btn small secondary" href="/api/blocklist.vcf?includeTop=1" download="nospamcalls-blocklist.vcf">Download Top-100 blocklist (.vcf)</a></p>
	</EmailCaptureBar>

	<h2>1. Register on the National Do Not Call list</h2>
	<p>
		The National Do Not Call Registry is a free U.S. government service. Register the phone that receives
		the calls, not a different line.
	</p>
	<ol>
		<li>
			Go to
			<a href="https://www.donotcall.gov/" rel="noopener noreferrer">donotcall.gov</a>
			and complete the registration yourself, or
		</li>
		<li>
			Call <a href="tel:+18883821222">1-888-382-1222</a> <em>from the phone number you want registered</em>
			(TTY: 1-866-290-4236).
		</li>
	</ol>
	<p>
		Legal telemarketers are supposed to stop calling registered numbers within 31 days. The registry does
		not stop illegal scammers, spoofed robocalls, political calls, or many debt-collection and
		informational calls.
	</p>

	<h2>2. Check your state’s do-not-call list</h2>
	<p>
		Some states keep their own lists or have extra rules. Search your state attorney general’s website for
		“do not call.” You still want the national registry even if your state has a list.
	</p>

	<h2>3. Turn on your carrier’s spam tools</h2>
	<ul>
		<li>
			<a href="https://www.t-mobile.com/benefits/scam-shield" rel="noopener noreferrer">T-Mobile Scam Shield</a>
			— network tools are included for many customers; you can also dial <code>#662#</code> to enable Scam Block.
		</li>
		<li>
			<a href="https://www.att.com/support/article/wireless/000116671/" rel="noopener noreferrer">AT&amp;T ActiveArmor</a>
			— basic spam blocking is included; Advanced is a paid add-on.
		</li>
		<li>
			<a href="https://www.verizon.com/support/call-filter-faqs/" rel="noopener noreferrer">Verizon Call Filter</a>
			— a free tier is included; Plus is a paid add-on.
		</li>
	</ul>
	<p>Carrier tools can also block wanted calls. Check missed-call lists if you are waiting on a delivery or a doctor.</p>

	<h2>4. Use the tools already on your phone</h2>
	<ul>
		<li>
			iPhone: Silence Unknown Callers, Live Voicemail, and Call Screening (on supported iOS versions). See
			<a href="https://support.apple.com/en-us/111106" rel="noopener noreferrer">Apple’s guide</a>
			and
			<a href="https://support.apple.com/guide/iphone/screen-and-block-calls-iphe4b3f7823/ios" rel="noopener noreferrer">Screen and block calls</a>.
		</li>
		<li>
			Android / Pixel: Call Screen and spam protection in the Phone app. See
			<a href="https://support.google.com/phoneapp/answer/9118387" rel="noopener noreferrer">Google Call Screen</a>.
		</li>
	</ul>

	<h2>5. Opt out of data-broker listings</h2>
	<p>
		People-search sites often republish your phone number. Opting out can reduce some legitimate sales
		calls. It will not stop illegal, spoofed robocalls. You can send opt-out requests yourself, or use a
		paid removal service. We do not endorse a particular vendor.
	</p>

	<h2>6. Report the number here, and to the government if it was illegal</h2>
	<p>
		<a href="/report">Add a community report on NoSpamCalls</a>
		so other people can see it. You can also complain to the
		<a href="https://www.donotcall.gov/" rel="noopener noreferrer">FTC</a>
		and the
		<a href="https://consumercomplaints.fcc.gov/hc/en-us" rel="noopener noreferrer">FCC</a>.
		Reporting is not the same as suing someone, and we cannot tell you whether you have a legal claim.
	</p>

	<h2>More guides</h2>
	<ul>
		<li><a href="/block-spam-calls">Block spam calls on iPhone, Android, and your carrier</a></li>
		<li><a href="/report-spam-calls">How to report spam calls to the FTC and FCC</a></li>
		<li><a href="/scams">Phone and text scam guides</a></li>
		<li><a href="/scam-likely">What “Scam Likely” means</a></li>
		<li><a href="/tcpa-rights">Your rights under the TCPA</a></li>
		<li><a href="/area-code">U.S. area-code directory</a></li>
	</ul>
</article>
