<script lang="ts">
	import ReportForm from '#lib/components/ReportForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Report a spam number — NoSpamCalls</title>
	<meta
		name="description"
		content="Report a robocall, scam, telemarketer, or other unwanted caller. Reports are public user opinions, not verified facts."
	/>
</svelte:head>

<h1>Report a number</h1>
<p class="lede">
	Tell other people what kind of call this was. Your report is a public comment, not a legal filing, and it
	does not notify the caller or guarantee that the calls will stop.
</p>

<ReportForm number={data.preset} {form} />
