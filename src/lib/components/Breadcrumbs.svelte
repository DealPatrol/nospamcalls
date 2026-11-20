<script lang="ts">
	import type { Crumb } from '#lib/seo';

	let { crumbs }: { crumbs: Crumb[] } = $props();
</script>

<nav class="breadcrumbs" aria-label="Breadcrumb">
	<ol>
		{#each crumbs as crumb, i}
			<li>
				{#if i === crumbs.length - 1}
					<span aria-current="page">{crumb.label}</span>
				{:else}
					<a href={crumb.href}>{crumb.label}</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
