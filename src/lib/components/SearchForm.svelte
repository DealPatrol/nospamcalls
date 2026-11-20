<script lang="ts">
	import { goto } from '$app/navigation';

	let { initial = '' }: { initial?: string } = $props();
	let value = $state('');
	$effect(() => {
		if (initial && !value) value = initial;
	});
	let error = $state('');

	function submit(event: Event) {
		event.preventDefault();
		error = '';
		const raw = value.trim();
		if (!raw) {
			error = 'Enter a phone number to look up.';
			return;
		}
		const digits = raw.replace(/[^\d+]/g, '');
		const slug = digits.replace(/^\+/, '');
		if (slug.length < 10) {
			error = 'Enter a full phone number, including area code.';
			return;
		}
		void goto(`/number/${slug}`);
	}
</script>

<form class="search-form" onsubmit={submit}>
	<label class="sr-only" for="phone-search">Phone number</label>
	<input
		id="phone-search"
		name="phone"
		type="tel"
		inputmode="tel"
		autocomplete="tel"
		placeholder="(555) 123-4567"
		bind:value
		aria-invalid={error ? 'true' : 'false'}
		aria-describedby={error ? 'phone-search-error' : undefined}
	/>
	<button type="submit">Look up</button>
	{#if error}
		<p id="phone-search-error" class="form-error">{error}</p>
	{/if}
</form>
