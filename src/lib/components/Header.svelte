<script lang="ts">
	import { page } from "$app/state";

	const links = [
		{ href: "/", label: "Home" },
		{ href: "/blocklist", label: "Block a Number" },
		{ href: "/get-paid", label: "Get Paid" },
		{ href: "/email-shield", label: "Email Shield" },
		{ href: "/opt-out", label: "Opt-Out" },
		{ href: "/setup", label: "Phone Setup" },
		{ href: "/business", label: "Business" }
	];

	function current(href: string, pathname: string): boolean {
		if (href === "/") return pathname === "/";
		return pathname === href || pathname.startsWith(`${href}/`);
	}
</script>

<header class="site-header">
	<div class="header-inner">
		<a class="wordmark" href="/">NoSpamCalls</a>
		<nav aria-label="Primary">
			{#each links as link}
				<a href={link.href} aria-current={current(link.href, page.url.pathname) ? "page" : undefined}>
					{link.label}
				</a>
			{/each}
		</nav>
	</div>
</header>
