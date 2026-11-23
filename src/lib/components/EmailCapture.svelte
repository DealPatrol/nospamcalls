<script lang="ts">
	import { enhance } from "$app/forms";
	import { QUIZ_QUESTIONS, type QuizAnswers } from "#lib/quiz";

	let {
		kind,
		sourcePath,
		submitLabel = "Email me this plan",
		showAppOptIn = false,
		answers = null,
		form = null,
		note = "We will only use your email for the updates you ask for. We are not sending mail yet — this saves your request until an email service is connected. No spam, and you can ask to be removed later."
	}: {
		kind: "quiz" | "checklist" | "article" | "exit";
		sourcePath: string;
		submitLabel?: string;
		showAppOptIn?: boolean;
		answers?: QuizAnswers | null;
		form?: { error?: string; success?: boolean; already?: boolean; kind?: string } | null;
		note?: string;
	} = $props();
</script>

<form method="POST" action="/protect?/email" use:enhance class="stack-form compact-form">
	<input type="hidden" name="kind" value={kind} />
	<input type="hidden" name="source_path" value={sourcePath} />
	{#if answers}
		{#each QUIZ_QUESTIONS as question}
			<input type="hidden" name={question.id} value={answers[question.id] ?? ""} />
		{/each}
	{/if}
	{#if form?.error}
		<p class="form-error" role="alert">{form.error}</p>
	{/if}
	{#if form?.success}
		<p class="form-success" role="status">
			{#if form.already}
				That email is already saved for this. We will use it only for the updates you asked for.
			{:else}
				Saved. We will only email you about this when an email service is connected, and only for the updates you asked for.
			{/if}
		</p>
	{/if}
	<label>
		<span>Email (optional)</span>
		<input name="email" type="email" autocomplete="email" placeholder="you@example.com" />
	</label>
	{#if showAppOptIn}
		<label class="check-label">
			<input type="checkbox" name="also_app" value="yes" />
			<span>Also add me to the app waitlist for founding-member pricing if we charge later (no payment now).</span>
		</label>
	{/if}
	<div class="hp" aria-hidden="true">
		<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
	</div>
	<button type="submit">{submitLabel}</button>
	<p class="fine-print">{note}</p>
</form>
