<script lang="ts">
	import { enhance } from "$app/forms";

	let {
		number,
		form = null
	}: {
		number: string;
		form?: { error?: string; success?: boolean; already?: boolean; alert?: boolean } | null;
	} = $props();

	const alertForm = $derived(form?.alert ? form : null);
</script>

<form method="POST" action="?/alert" use:enhance class="stack-form compact-form">
	<input type="hidden" name="number" value={number} />
	{#if alertForm?.error}
		<p class="form-error" role="alert">{alertForm.error}</p>
	{/if}
	{#if alertForm?.success}
		<p class="form-success" role="status">
			{#if alertForm.already}
				That email is already signed up for alerts on this number.
			{:else}
				Request saved. We are not sending number alerts yet. When an email service is connected, we will only email you if this number is reported again.
			{/if}
		</p>
	{/if}
	<label>
		<span>Email</span>
		<input name="email" type="email" required autocomplete="email" placeholder="you@example.com" />
	</label>
	<div class="hp" aria-hidden="true">
		<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
	</div>
	<button type="submit">Notify me if this number is reported again</button>
	<p class="fine-print">
		This is optional. We will only use this email for alerts about this number, and only after an email
		service is set up. No payment, and you can ask to be removed later.
	</p>
</form>
