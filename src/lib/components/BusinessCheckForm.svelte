<script lang="ts">
	import { enhance } from "$app/forms";

	let {
		form = null
	}: {
		form?: {
			error?: string;
			success?: boolean;
			check?: boolean;
			e164?: string;
			slug?: string;
			reportCount?: number;
		} | null;
	} = $props();

	const checkForm = $derived(form?.check ? form : null);
</script>

<form method="POST" action="?/check" use:enhance class="stack-form">
	{#if checkForm?.error}
		<p class="form-error" role="alert">{checkForm.error}</p>
	{/if}
	{#if checkForm?.success}
		<div class="form-success" role="status">
			<p>Request saved. Here is what we can tell you today:</p>
			<ul>
				<li>
					{#if (checkForm.reportCount ?? 0) > 0}
						This number has {checkForm.reportCount} community
						{checkForm.reportCount === 1 ? "report" : "reports"} on NoSpamCalls.
						<a href="/number/{checkForm.slug}">See the public page</a>.
					{:else}
						This number has no community reports on NoSpamCalls yet. That does not mean carriers are not
						flagging it — our log is not what AT&amp;T, Verizon, T-Mobile, or caller-ID apps use.
					{/if}
				</li>
				<li>
					Your email was also added to the business waitlist so we can follow up if a reputation service
					launches. We cannot promise to clear a “Scam Likely” label.
				</li>
			</ul>
			<p>
				Next official steps: ask the carrier that originates your calls about STIR/SHAKEN signing and any
				dispute process, and read <a href="/scam-likely">what “Scam Likely” means</a>.
			</p>
		</div>
	{/if}

	<label>
		<span>Business or organization name</span>
		<input name="business_name" type="text" required maxlength="120" autocomplete="organization" />
	</label>
	<label>
		<span>Business phone number that is being flagged</span>
		<input name="number" type="tel" inputmode="tel" required autocomplete="tel" />
	</label>
	<label>
		<span>Email</span>
		<input name="email" type="email" required autocomplete="email" placeholder="you@example.com" />
	</label>
	<label>
		<span>What are customers seeing? (optional)</span>
		<textarea name="notes" rows="3" maxlength="400" placeholder="For example: outbound calls show Scam Likely on iPhone."></textarea>
	</label>
	<div class="hp" aria-hidden="true">
		<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
	</div>
	<button type="submit">Request a free Scam Likely check</button>
	<p class="fine-print">
		This stores your details and adds your email to the business waitlist so we can follow up. It is not
		an official carrier lookup, and we cannot guarantee a label will be cleared. We are not sending mail
		yet; this saves your request until an email service is connected.
	</p>
</form>
