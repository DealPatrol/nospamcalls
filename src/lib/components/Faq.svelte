<script lang="ts">
	let { faqs, heading = 'Frequently asked questions' }: { faqs: { q: string; a: string }[]; heading?: string } = $props();
</script>

<section class="faq">
	<h2>{heading}</h2>
	{#each faqs as faq}
		<details>
			<summary>{faq.q}</summary>
			<p>{faq.a}</p>
		</details>
	{/each}
</section>
