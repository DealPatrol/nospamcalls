<script lang="ts">
	let {
		variant = "protect",
		heading,
		body,
		href,
		label
	}: {
		variant?: "protect" | "app" | "report" | "business";
		heading: string;
		body: string;
		href: string;
		label: string;
	} = $props();
</script>

<aside class="topic-cta topic-cta--{variant}">
	<h2>{heading}</h2>
	<p>{body}</p>
	<p><a class="cta-button" href={href}>{label}</a></p>
</aside>
