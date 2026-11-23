<script lang="ts">
	let {
		reports = 0,
		appWaitlist = 0,
		businessWaitlist = 0
	}: {
		reports?: number;
		appWaitlist?: number;
		businessWaitlist?: number;
	} = $props();

	const hasCounts = $derived(reports > 0 || appWaitlist > 0 || businessWaitlist > 0);
</script>

{#if hasCounts}
	<p class="social-proof">
		{#if reports > 0}
			<span>{reports} community report{reports === 1 ? '' : 's'}</span>
		{/if}
		{#if appWaitlist > 0}
			<span>{appWaitlist} on the app waitlist</span>
		{/if}
		{#if businessWaitlist > 0}
			<span>{businessWaitlist} businesses waiting for a Scam Likely check-in</span>
		{/if}
	</p>
{:else}
	<p class="social-proof muted">This directory is new. Your report or waitlist signup can be one of the first.</p>
{/if}
