<script lang="ts">
	import { onMount } from "svelte";
	import { getAccountKey, postJson, setAccountKey } from "#lib/account";

	type Blocked = { e164: string; caller_label: string | null; call_type: string; note: string | null; created_at: string };

	let {
		heading = "A spam call got through?",
		showDetails = false,
		initialNumber = "",
		onchange
	}: {
		heading?: string;
		showDetails?: boolean;
		initialNumber?: string;
		onchange?: (numbers: Blocked[], key: string) => void;
	} = $props();

	let number = $state("");
	let email = $state("");
	let callType = $state("robocall");
	let company = $state("");
	let note = $state("");
	let website = $state("");
	let busy = $state(false);
	let error = $state("");
	let added = $state<{ e164: string; already: boolean } | null>(null);
	let key = $state("");

	onMount(() => {
		key = getAccountKey();
		if (initialNumber) number = initialNumber;
	});

	const vcfHref = $derived(key ? `/api/blocklist.vcf?key=${key}&includeTop=1` : "/api/blocklist.vcf?includeTop=1");

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = "";
		added = null;
		busy = true;
		try {
			const res = await postJson<{ key: string; e164: string; already: boolean; numbers: Blocked[] }>("/api/blocklist", {
				key: key || getAccountKey(),
				email,
				number,
				callType,
				company,
				note,
				website
			});
			key = res.key;
			setAccountKey(res.key);
			added = { e164: res.e164, already: res.already };
			number = "";
			note = "";
			company = "";
			onchange?.(res.numbers, res.key);
		} catch (err) {
			error = (err as Error).message;
		} finally {
			busy = false;
		}
	}
</script>

<div class="tool-card accent">
	<h2>{heading}</h2>
	<p class="muted">Enter the number. We add it to your personal blocklist right away so it won’t get through again.</p>
	<form class="tool-form" onsubmit={submit}>
		<label>
			<span>Phone number that called or texted you</span>
			<input type="tel" bind:value={number} placeholder="(217) 555-0123" required autocomplete="off" inputmode="tel" />
		</label>
		{#if showDetails}
			<label>
				<span>What kind of call?</span>
				<select bind:value={callType}>
					<option value="robocall">Robocall / recorded message</option>
					<option value="scam">Scam</option>
					<option value="telemarketer">Telemarketer</option>
					<option value="debt_collector">Debt collector</option>
					<option value="other">Other</option>
				</select>
			</label>
			<label>
				<span>Company they claimed to be (optional)</span>
				<input type="text" bind:value={company} maxlength="120" placeholder="e.g. “Auto warranty department”" />
			</label>
			<label>
				<span>Note (optional, may appear as a public comment — no personal info or links)</span>
				<input type="text" bind:value={note} maxlength="300" />
			</label>
		{/if}
		<label>
			<span>Email (optional — syncs your list across devices)</span>
			<input type="email" bind:value={email} placeholder="you@example.com" autocomplete="email" />
		</label>
		<label class="hp" aria-hidden="true">Website <input type="text" bind:value={website} tabindex="-1" autocomplete="off" /></label>
		<button class="btn" type="submit" disabled={busy}>{busy ? "Blocking…" : "Block this number"}</button>
	</form>
	{#if error}<p class="form-error" role="alert">{error}</p>{/if}
	{#if added}
		<div class="form-success" role="status">
			<p><strong>{added.already ? "Already on your list" : "Blocked on your list"}:</strong> {added.e164}</p>
			<div class="btn-row">
				<a class="btn" href={vcfHref} download="nospamcalls-blocklist.vcf">Download updated blocklist (.vcf)</a>
				<a class="btn secondary" href={`/get-paid?number=${encodeURIComponent(added.e164)}#log`}>Log this call for a $500–$1,500 TCPA claim</a>
			</div>
			<p class="muted">
				Import the .vcf on your phone and block the “NoSpamCalls Blocklist” contact. <a href="/blocklist">See your full list</a>.
			</p>
		</div>
	{/if}
</div>
