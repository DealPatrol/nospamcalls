<script lang="ts">
	import { enhance } from '$app/forms';
	import { CATEGORIES } from '#lib/categories';
	import { COMMENT_MAX } from '#lib/limits';
	let {
		number = '',
		form,
		action = '/report?/create'
	}: {
		number?: string;
		form?: { error?: string; success?: boolean } | null;
		action?: string;
	} = $props();
</script>

<form method="POST" {action} use:enhance class="stack-form">
	{#if form?.error}
		<p class="form-error" role="alert">{form.error}</p>
	{/if}
	{#if form?.success}
		<p class="form-success" role="status">Thanks. Your report is now on the lookup page.</p>
	{/if}

	<label>
		<span>Phone number</span>
		<input name="number" type="tel" inputmode="tel" autocomplete="tel" required value={number} />
	</label>

	<label>
		<span>What kind of call was it?</span>
		<select name="category" required>
			<option value="" disabled selected>Choose a category</option>
			{#each CATEGORIES as category}
				<option value={category.id}>{category.label}</option>
			{/each}
		</select>
	</label>

	<label>
		<span>Comment (optional)</span>
		<textarea name="comment" rows="4" maxlength={COMMENT_MAX} placeholder="What happened? No links, please."></textarea>
	</label>

	<!-- Honeypot: leave empty. -->
	<div class="hp" aria-hidden="true">
		<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
	</div>

	<button type="submit">Submit report</button>
	<p class="fine-print">
		Reports are public user opinions, not verified facts. Do not include names, account numbers, or other personal information.
	</p>
</form>
