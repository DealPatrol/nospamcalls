<script lang="ts">
	import { page } from "$app/state";
	import { onMount } from "svelte";

	const hiddenOn = ["/protect", "/app", "/business", "/privacy", "/terms", "/report"];
	let visible = $state(false);
	let dismissed = $state(true);

	const allowed = $derived(
		!hiddenOn.some((path) => page.url.pathname === path || page.url.pathname.startsWith(`${path}/`))
	);

	function dismiss() {
		visible = false;
		dismissed = true;
		try {
			localStorage.setItem("nsc-scroll-offer", String(Date.now()));
		} catch {
			// ignore
		}
	}

	function maybeShow() {
		if (!allowed || dismissed) return;
		visible = true;
	}

	onMount(() => {
		let recently = false;
		try {
			const raw = localStorage.getItem("nsc-scroll-offer");
			recently = Boolean(raw && Date.now() - Number(raw) < 14 * 24 * 60 * 60 * 1000);
		} catch {
			recently = false;
		}
		dismissed = recently;
		if (!allowed || dismissed) return;

		function onScroll() {
			const el = document.documentElement;
			const scrolled =
				el.scrollHeight > el.clientHeight + 200 &&
				el.scrollTop + el.clientHeight >= el.scrollHeight * 0.55;
			if (scrolled) maybeShow();
		}
		function onLeave(event: MouseEvent) {
			if (event.clientY <= 0) maybeShow();
		}
		window.addEventListener("scroll", onScroll, { passive: true });
		document.addEventListener("mouseleave", onLeave);
		return () => {
			window.removeEventListener("scroll", onScroll);
			document.removeEventListener("mouseleave", onLeave);
		};
	});
</script>

{#if allowed && visible && !dismissed}
	<div class="scroll-offer" role="dialog" aria-label="Free spam-protection checkup">
		<p>
			<strong>Free 2-minute checkup:</strong> get a personalized plan to cut down spam calls. No account required.
		</p>
		<p class="scroll-offer-actions">
			<a class="cta-button" href="/protect" onclick={dismiss}>Get my plan</a>
			<button type="button" class="text-button" onclick={dismiss}>No thanks</button>
		</p>
	</div>
{/if}
