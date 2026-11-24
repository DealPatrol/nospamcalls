<script lang="ts">
	import BusinessCheckForm from "#lib/components/BusinessCheckForm.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import SocialProof from "#lib/components/SocialProof.svelte";
	import { SITE_NAME } from "#lib/site";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();
	const title = `Free Scam Likely check for businesses — ${SITE_NAME}`;
	const description =
		"Request a free Scam Likely check if customers say your legitimate business number is labeled spam. See what is in our community log and get official next steps. No payment, and no promise that a label will be cleared.";
	const canonical = $derived(`${data.origin}/business`);
</script>

<SeoHead {title} {description} {canonical} />

<h1>Free Scam Likely check for businesses</h1>
<p class="lede">
	If customers ignore your calls because the phone says “Scam Likely” or “Spam Likely,” you can request a
	free check. We will look in our community report log, tell you what we see, and point you to official
	carrier and FCC steps. We cannot promise to clear a label, and this is not an official carrier lookup.
</p>

<SocialProof reports={data.stats.reports} appWaitlist={data.stats.appWaitlist} businessWaitlist={data.stats.businessWaitlist} />

<BusinessCheckForm {form} />

<h2>What this is — and is not</h2>
<ul>
	<li>It is a request for a look at our public community log, plus a waitlist for a future reputation service.</li>
	<li>It is not a guarantee, a legal filing, or a same-day unflag from AT&amp;T, Verizon, T-Mobile, Hiya, or similar apps.</li>
	<li>Read <a href="/scam-likely">what “Scam Likely” means</a> for how those labels usually work.</li>
	<li>Filtering spam on your own line? Read <a href="/business/missed-customer-calls">how to block spam calls without missing customers</a>.</li>
</ul>
