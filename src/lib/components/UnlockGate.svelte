<script lang="ts">
	import { onMount, type Snippet } from "svelte";
	import EmailCaptureBar from "./EmailCaptureBar.svelte";
	import { initUnlock, unlock } from "#lib/unlock.svelte";

	/** Shows `children` (download / print / copy buttons) once the visitor has unlocked with one email. */
	let {
		headline,
		sub = "",
		leadMagnet,
		contextValue = null,
		button = "Unlock free",
		children
	}: {
		headline: string;
		sub?: string;
		leadMagnet: string;
		contextValue?: string | null;
		button?: string;
		children: Snippet;
	} = $props();

	onMount(initUnlock);
</script>

{#if unlock.unlocked}
	{@render children()}
{:else}
	<EmailCaptureBar {headline} {sub} {leadMagnet} {contextValue} {button} compact />
{/if}
