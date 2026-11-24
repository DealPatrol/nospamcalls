<script lang="ts">
	import { page } from "$app/state";
	import { postJson } from "#lib/account";

	let { kind, label = "Email", button = "Notify me", success = "Saved." }: { kind: "founding_plan" | "tcpa_settlements"; label?: string; button?: string; success?: string } = $props();
	let email = $state("");
	let website = $state("");
	let busy = $state(false);
	let message = $state("");
	let error = $state("");

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		error = "";
		message = "";
		try {
			const res = await postJson<{ already?: boolean }>("/api/signup", { kind, email, website, sourcePath: page.url.pathname });
			message = res.already ? "You were already on this list — you’re all set." : success;
			email = "";
		} catch (err) {
			error = (err as Error).message;
		} finally {
			busy = false;
		}
	}
</script>

<form class="tool-form" onsubmit={submit}>
	<label>
		<span>{label}</span>
		<input type="email" bind:value={email} required autocomplete="email" placeholder="you@example.com" />
	</label>
	<label class="hp" aria-hidden="true">Website <input type="text" bind:value={website} tabindex="-1" autocomplete="off" /></label>
	<button class="btn" type="submit" disabled={busy}>{busy ? "Saving…" : button}</button>
	{#if message}<p class="form-success" role="status">{message}</p>{/if}
	{#if error}<p class="form-error" role="alert">{error}</p>{/if}
</form>
