<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: '/', label: 'Lookup' },
		{ href: '/stop-spam-calls', label: 'Stop spam' },
		{ href: '/report', label: 'Report a number' },
		{ href: '/business', label: 'For business' },
		{ href: '/app', label: 'App waitlist' }
	];
</script>

<header class="site-header">
	<div class="header-inner">
		<a class="wordmark" href="/">NoSpamCalls</a>
		<nav aria-label="Primary">
			{#each links as link}
				<a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>
					{link.label}
				</a>
			{/each}
		</nav>
	</div>
</header>
