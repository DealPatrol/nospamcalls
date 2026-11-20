<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — NoSpamCalls</title>
</svelte:head>

<h1>{page.status}</h1>
<p class="lede">{page.error?.message ?? 'Something went wrong.'}</p>
<p><a href="/">Back to the lookup</a></p>
