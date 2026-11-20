<script lang="ts">
	import WaitlistForm from '#lib/components/WaitlistForm.svelte';
	import { SITE_NAME } from '#lib/site';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const canonical = $derived(`${data.origin}/business`);
</script>

<svelte:head>
	<title>Is your number flagged Scam Likely? — {SITE_NAME}</title>
	<meta
		name="description"
		content="Join the waitlist if your legitimate business number is labeled Scam Likely or Spam Likely. We are building a number-reputation and unflagging service."
	/>
	<link rel="canonical" href={canonical} />
</svelte:head>

<h1>Is your number flagged “Scam Likely”?</h1>
<p class="lede">
	Carriers and caller-ID apps sometimes label a real shop, clinic, or office as spam. Customers then
	ignore appointment reminders and sales calls. We are planning a service that helps businesses check
	their labeling and work through the official registration and dispute channels.
</p>
<p>
	This waitlist is interest only. We cannot guarantee that a label will be cleared, and the product is
	not for sale yet.
</p>

<WaitlistForm type="business" {form} submitLabel="Join the business waitlist" />
