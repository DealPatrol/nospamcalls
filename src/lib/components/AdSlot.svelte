<script lang="ts">
	let { label = 'Advertisement' }: { label?: string } = $props();
</script>

<aside class="ad-slot" aria-label={label}>
	<p class="ad-slot__label">{label}</p>
	<p class="ad-slot__placeholder">Ad space reserved. No ad network is connected yet.</p>
</aside>
