<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		type,
		form,
		submitLabel = 'Join the waitlist'
	}: {
		type: 'app' | 'business';
		form?: { error?: string; success?: boolean; already?: boolean } | null;
		submitLabel?: string;
	} = $props();
</script>

<form method="POST" use:enhance class="stack-form">
	<input type="hidden" name="type" value={type} />
	{#if form?.error}
		<p class="form-error" role="alert">{form.error}</p>
	{/if}
	{#if form?.success}
		<p class="form-success" role="status">
			{#if form.already}
				That email is already on this list. We will be in touch.
			{:else}
				You are on the list. We will email you when this is ready.
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

	<button type="submit">{submitLabel}</button>
	<p class="fine-print">We will only use this email for updates about this product. No spam.</p>
</form>
