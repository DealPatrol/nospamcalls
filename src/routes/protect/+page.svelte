<script lang="ts">
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import EmailCapture from "#lib/components/EmailCapture.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import { articleJsonLd, breadcrumbJsonLd, type Crumb } from "#lib/seo";
	import { QUIZ_QUESTIONS, quizLabel, scoreQuiz, type QuizAnswers } from "#lib/quiz";
	import type { PageProps } from "./$types";

	let { data, form }: PageProps = $props();

	let answers = $state<Partial<QuizAnswers>>({});
	let submitted = $state(false);

	const complete = $derived(QUIZ_QUESTIONS.every((q) => answers[q.id] === "yes" || answers[q.id] === "no"));
	const score = $derived(complete ? scoreQuiz(answers as QuizAnswers) : 0);
	const crumbs: Crumb[] = [
		{ href: "/", label: "Home" },
		{ href: "/protect", label: "Spam-protection checkup" }
	];
	const title = "Free spam-protection checkup";
	const description =
		"Answer six questions and get a personalized, printable plan to cut down spam calls. Free, no account required. Email is optional.";
	const canonical = $derived(`${data.origin}/protect`);

	function showPlan() {
		if (complete) submitted = true;
	}

	function resetQuiz() {
		answers = {};
		submitted = false;
	}
</script>

<SeoHead
	{title}
	{description}
	{canonical}
	jsonLd={[
		breadcrumbJsonLd(data.origin, crumbs),
		articleJsonLd({ origin: data.origin, path: "/protect", headline: title, description })
	]}
/>
<Breadcrumbs {crumbs} />

<article class="prose">
	<h1>Free spam-protection checkup</h1>
	{#if form?.success}
		<p class="form-success" role="status">Your email was saved for the updates you asked for. We are not sending mail yet.</p>
	{/if}
	<div class="answer-box">
		<p class="answer-label">In short</p>
		<p>
			Answer six yes-or-no questions about how you handle unknown calls and scam texts. You will get a
			personalized plan you can print. Email is optional and not required to see your results.
		</p>
	</div>

	{#if !submitted}
		<form class="quiz" onsubmit={(event) => { event.preventDefault(); showPlan(); }}>
			{#each QUIZ_QUESTIONS as question, index}
				<fieldset class="quiz-question">
					<legend>{index + 1}. {question.prompt}</legend>
					<label class="check-label">
						<input type="radio" name={question.id} value="yes" bind:group={answers[question.id]} required />
						Yes
					</label>
					<label class="check-label">
						<input type="radio" name={question.id} value="no" bind:group={answers[question.id]} required />
						No
					</label>
				</fieldset>
			{/each}
			<button type="submit" class="cta-button cta-button-solid">See my free plan</button>
		</form>
	{:else}
		<div class="quiz-results">
			<p class="muted">Your result</p>
			<h2>{score} out of {QUIZ_QUESTIONS.length}: {quizLabel(score)}</h2>
			<p>
				This is a checklist of free, official steps — not a guarantee that spam will stop, and not a
				security audit of your phone.
			</p>
			<ol class="plan-list">
				{#each QUIZ_QUESTIONS as question}
					{@const good = answers[question.id] === question.good}
					{@const item = good ? question.yesPlan : question.noPlan}
					<li class={good ? "plan-ok" : "plan-next"}>
						<strong>{item.title}</strong>
						<p>{item.body}</p>
						{#if item.href && item.label}
							<p><a href={item.href}>{item.label}</a></p>
						{/if}
					</li>
				{/each}
			</ol>
			<p class="print-actions no-print">
				<button type="button" class="cta-button cta-button-solid" onclick={() => window.print()}>
					Print this plan
				</button>
				<button type="button" class="text-button" onclick={resetQuiz}>Start over</button>
			</p>

			<section class="no-print">
				<h2>Email this plan (optional)</h2>
				<p>
					You do not need to leave an email to keep or print the plan. If you want a copy later, or
					founding-member notice if an app launches, you can add your email below.
				</p>
				<EmailCapture
					kind="quiz"
					sourcePath="/protect"
					showAppOptIn={true}
					answers={answers as QuizAnswers}
					{form}
					submitLabel="Save my email for this plan"
				/>
			</section>
		</div>
	{/if}

	<section class="no-print">
		<h2>Use these tools today</h2>
		<ul>
			<li><a href="/block-spam-calls">Block spam calls on iPhone, Android, and your carrier</a></li>
			<li><a href="/stop-spam-calls">Register on the National Do Not Call list</a></li>
			<li><a href="/report-spam-calls">Report scams to the FTC and FCC</a></li>
			<li><a href="/app">Join the app waitlist</a> (founding-member pricing if we charge later; no payment now)</li>
		</ul>
	</section>
</article>
