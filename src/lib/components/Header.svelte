<script lang="ts">
	import { page } from "$app/state";

	const links = [
		{ href: "/", label: "Lookup" },
		{ href: "/protect", label: "Checkup" },
		{ href: "/scams", label: "Scams" },
		{ href: "/block-spam-calls", label: "Block spam" },
		{ href: "/area-code", label: "Area codes" },
		{ href: "/report", label: "Report a number" },
		{ href: "/business", label: "For business" },
		{ href: "/app", label: "App waitlist" }
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
