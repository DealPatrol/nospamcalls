<script lang="ts">
	import { SITE_NAME } from '#lib/site';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const state = $derived(form?.state === 'done' ? 'done' : data.state);
</script>

<svelte:head>
	<title>Unsubscribe — {SITE_NAME}</title>
	<meta name="robots" content="noindex, nofollow" />
	<meta name="description" content="Unsubscribe from NoSpamCalls emails." />
</svelte:head>

<article class="prose">
	{#if state === 'done'}
		<h1>You're unsubscribed from NoSpamCalls emails</h1>
		<p>
			You will not get further alerts, digests, or reminders from us. You can still use every free
			tool on the site, and you can sign up again later if you want updates.
		</p>
		<p><a href="/">Back to NoSpamCalls</a></p>
	{:else}
		<h1>Unsubscribe from NoSpamCalls emails?</h1>
		<p>
			You will stop receiving alert, digest, and reminder emails. Free tools on the site will still
			be available.
		</p>
		<form method="POST">
			<input type="hidden" name="token" value={data.token} />
			<button class="btn" type="submit">Confirm unsubscribe</button>
		</form>
	{/if}
</article>
