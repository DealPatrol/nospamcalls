<script lang="ts">
	import GuidePage from "#lib/components/GuidePage.svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<GuidePage guide={data.guide} origin={data.origin} />
