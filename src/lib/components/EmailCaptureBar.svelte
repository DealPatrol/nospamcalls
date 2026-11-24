<script lang="ts">
	import { onMount, type Snippet } from "svelte";
	import { initUnlock, submitLead, unlock } from "#lib/unlock.svelte";

	let {
		headline,
		sub = "",
		leadMagnet,
		contextValue = null,
		button = "Send it free",
		unlockedText = "Unlocked — every free download and printable on NoSpamCalls is open for you.",
		alwaysAsk = false,
		compact = false,
		onunlock,
		children
	}: {
		headline: string;
		sub?: string;
		leadMagnet: string;
		contextValue?: string | null;
		button?: string;
		unlockedText?: string;
		/** For alert subscriptions tied to a specific number/area code: offer a one-click add even when already unlocked. */
		alwaysAsk?: boolean;
		compact?: boolean;
		onunlock?: () => void;
		children?: Snippet;
	} = $props();

	let email = $state("");
	let website = $state("");
	let busy = $state(false);
	let error = $state("");
	let done = $state(false);

	onMount(() => {
		initUnlock();
		if (!email && unlock.email) email = unlock.email;
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = "";
		busy = true;
		try {
			await submitLead({ email, leadMagnet, contextValue, website });
			done = true;
			onunlock?.();
		} catch (err) {
			error = (err as Error).message;
		} finally {
			busy = false;
		}
	}

	async function oneClick() {
		email = unlock.email;
		busy = true;
		error = "";
		try {
			await submitLead({ email, leadMagnet, contextValue });
			done = true;
			onunlock?.();
		} catch (err) {
			error = (err as Error).message;
		} finally {
			busy = false;
		}
	}

	const showForm = $derived(!done && !(unlock.unlocked && !alwaysAsk));
</script>

<div class="capture-bar no-print" class:compact data-lead={leadMagnet}>
	<p class="capture-headline"><strong>{headline}</strong></p>
	{#if sub}<p class="capture-sub">{sub}</p>{/if}
	{#if done}
		<p class="form-success" role="status">✓ You’re in. {unlockedText}</p>
		{@render children?.()}
	{:else if unlock.unlocked && alwaysAsk && unlock.email}
		<div class="capture-row">
			<button class="btn" type="button" onclick={oneClick} disabled={busy}>{busy ? "Saving…" : `Yes, alert ${unlock.email}`}</button>
			{@render children?.()}
		</div>
	{:else if showForm}
		<form class="capture-row" onsubmit={submit}>
			<label class="sr-only" for={`cap-${leadMagnet}`}>Email address</label>
			<input
				id={`cap-${leadMagnet}`}
				type="email"
				bind:value={email}
				required
				autocomplete="email"
				inputmode="email"
				placeholder="you@email.com"
				maxlength="254"
			/>
			<label class="hp" aria-hidden="true">Website <input type="text" bind:value={website} tabindex="-1" autocomplete="off" /></label>
			<button class="btn" type="submit" disabled={busy}>{busy ? "Sending…" : button}</button>
		</form>
		<p class="capture-fine">Free. One email unlocks every download on the site. Unsubscribe anytime. <a href="/privacy">Privacy</a></p>
	{:else}
		<p class="form-success" role="status">✓ {unlockedText}</p>
		{@render children?.()}
	{/if}
	{#if error}<p class="form-error" role="alert">{error}</p>{/if}
</div>
