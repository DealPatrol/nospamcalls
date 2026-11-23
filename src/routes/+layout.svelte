<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import ScrollOffer from '#lib/components/ScrollOffer.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#12233A" />
</svelte:head>

<div class="site-shell">
	<Header />
	<main class="page">
		{@render children()}
	</main>
	<Footer />
	<ScrollOffer />
</div>
