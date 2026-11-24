<script lang="ts">
	import { onMount } from "svelte";
	import { PRO_FEATURES } from "#lib/content/pro";
	import { initUnlock, submitLead, unlock } from "#lib/unlock.svelte";

	let { heading = "NoSpamCalls Pro — free early access" }: { heading?: string } = $props();
	let picked = $state<string[]>(["live_screening"]);
	let email = $state("");
	let website = $state("");
	let busy = $state(false);
	let error = $state("");
	let done = $state(false);

	onMount(() => {
		initUnlock();
		if (unlock.email) email = unlock.email;
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = "";
		busy = true;
		try {
			await submitLead({ email, leadMagnet: "pro_waitlist", proInterests: picked, website });
			done = true;
		} catch (err) {
			error = (err as Error).message;
		} finally {
			busy = false;
		}
	}
</script>

<section class="tool-card pro-card" id="pro">
	<p class="answer-label">Coming soon · not for sale yet</p>
	<h2>{heading}</h2>
	<p>
		Everything on this site is free today. Pro will be the hands-off, automated version. It is not launched, has no price
		yet, and nothing is charged. Tick what you would want most — your votes decide what we build first.
	</p>
	{#if done}
		<p class="form-success" role="status">✓ You’re on the Pro early-access list. We’ll email you before anything launches. Every free download is now unlocked too.</p>
	{:else}
		<form class="tool-form" onsubmit={submit}>
			<fieldset class="pro-options">
				<legend>Which Pro features do you want? (pick any)</legend>
				{#each PRO_FEATURES as f}
					<label class="check-label">
						<input type="checkbox" value={f.id} bind:group={picked} />
						<span><strong>{f.label}</strong> — {f.text}</span>
					</label>
				{/each}
			</fieldset>
			<div class="capture-row">
				<label class="sr-only" for="pro-email">Email address</label>
				<input id="pro-email" type="email" bind:value={email} required autocomplete="email" placeholder="you@email.com" maxlength="254" />
				<label class="hp" aria-hidden="true">Website <input type="text" bind:value={website} tabindex="-1" autocomplete="off" /></label>
				<button class="btn" type="submit" disabled={busy}>{busy ? "Saving…" : "Join free early access"}</button>
			</div>
			<p class="capture-fine">Free to join. No payment details. Unsubscribe anytime.</p>
		</form>
	{/if}
	{#if error}<p class="form-error" role="alert">{error}</p>{/if}
</section>
