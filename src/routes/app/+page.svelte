<script lang="ts">
	import WaitlistForm from '#lib/components/WaitlistForm.svelte';
	import { SITE_NAME } from '#lib/site';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const canonical = $derived(`${data.origin}/app`);
</script>

<svelte:head>
	<title>App waitlist — {SITE_NAME}</title>
	<meta
		name="description"
		content="Get an email when the NoSpamCalls mobile app is available. The website already lets you look up and report numbers for free."
	/>
	<link rel="canonical" href={canonical} />
</svelte:head>

<h1>Get an email when the app is ready</h1>
<p class="lede">
	A consumer app is on the roadmap: call logging, Do Not Call help, and optional screening. It is not in
	the App Store or Google Play yet. Leave your email if you want a note when that changes.
</p>

<WaitlistForm type="app" {form} submitLabel="Notify me about the app" />
