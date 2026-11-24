<script lang="ts">
	let { feature, text }: { feature: string; text: string } = $props();
</script>

<aside class="pro-callout no-print">
	<p><span class="pill">Pro · coming soon</span> <strong>{feature}</strong></p>
	<p>{text} Everything on this page stays free. <a href="/app#pro">Join the free Pro early-access list</a> and vote for it.</p>
</aside>
