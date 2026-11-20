<script lang="ts">
	import { SITE_NAME } from '#lib/site';

	let {
		title,
		description,
		canonical,
		type = 'article',
		jsonLd = []
	}: {
		title: string;
		description: string;
		canonical: string;
		type?: 'article' | 'website';
		jsonLd?: unknown[];
	} = $props();

	const fullTitle = $derived(title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`);
	const payloads = $derived(jsonLd.filter(Boolean));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	{#each payloads as data, i (i)}
		{@html `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`}
	{/each}
</svelte:head>
