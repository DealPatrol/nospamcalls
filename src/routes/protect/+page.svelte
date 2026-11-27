<script lang="ts">
	import Breadcrumbs from "#lib/components/Breadcrumbs.svelte";
	import EmailCaptureBar from "#lib/components/EmailCaptureBar.svelte";
	import UnlockGate from "#lib/components/UnlockGate.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";
	import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, type Crumb } from "#lib/seo";
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
	const title = "Free Spam Call Blocker Checkup: Your 6-Step Plan";
	const description =
		"Which free spam call blocker settings are you missing? Answer six yes-or-no questions and get a printable plan for your carrier and phone. No account needed.";
	const faqs = [
		{
			q: "What is the best free spam call blocker?",
			a: "Start with the free tools you already have: your carrier’s filter (AT&T ActiveArmor, Verizon Call Filter, or T-Mobile Scam Shield) and your phone’s own setting (Silence Unknown Callers on iPhone, or spam filtering and Call Screen in the Google Phone app on many Android phones). This checkup shows which of those steps you have not done yet."
		},
		{
			q: "Do I need to pay for a spam call blocker app?",
			a: "Not to start. The free carrier and phone settings block or label many spam calls, and the National Do Not Call Registry is free. No blocker, free or paid, stops every scam call, so the plan also covers what to do when one gets through."
		},
		{
			q: "What does this spam-protection checkup do?",
			a: "You answer six yes-or-no questions about how you handle unknown calls and scam texts. You get a personalized plan right away, with links to the official steps. It is free and needs no account; printing the plan asks for your email once."
		}
	];
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
		articleJsonLd({ origin: data.origin, path: "/protect", headline: title, description }),
		faqJsonLd(faqs)
	]}
/>
<Breadcrumbs {crumbs} />

<article class="prose">
	<h1>Free spam call blocker checkup</h1>
	{#if form?.success}
		<p class="form-success" role="status">Your email was saved for the updates you asked for. We are not sending mail yet.</p>
	{/if}
	<div class="answer-box">
		<p class="answer-label">In short</p>
		<p>
			Answer six yes-or-no questions about how you handle unknown calls and scam texts. You will get a
			personalized plan. Your results show right away; printing the plan asks for your email once.
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
			<div class="no-print">
				<UnlockGate
					headline="Print or save your personal protection plan — free"
					sub="Enter your email once to print this plan. We’ll also send weekly scam alerts and our Top-100 spammer blocklist. Unsubscribe anytime."
					leadMagnet="guide_checklist"
					contextValue="protect-plan"
					button="Unlock my plan"
				>
					<p class="print-actions">
						<button type="button" class="cta-button cta-button-solid" onclick={() => window.print()}>
							Print this plan
						</button>
						<a class="btn small secondary" href="/api/blocklist.vcf?includeTop=1" download="nospamcalls-blocklist.vcf">Download Top-100 blocklist (.vcf)</a>
					</p>
				</UnlockGate>
				<p><button type="button" class="text-button" onclick={resetQuiz}>Start over</button></p>
			</div>
		</div>
	{/if}

	<section class="no-print">
		<h2>Use these tools today</h2>
		<ul>
			<li><a href="/block-spam-calls">Block spam calls on iPhone, Android, and your carrier</a></li>
			<li><a href="/stop-spam-calls">Register on the National Do Not Call list</a></li>
			<li><a href="/report-spam-calls">Report scams to the FTC and FCC</a></li>
			<li><a href="/blocklist">Block a number that got through</a> and <a href="/get-paid">see open TCPA settlements</a></li>
			<li><a href="/app#pro">Join the free NoSpamCalls Pro early-access list</a> (not launched, nothing to pay)</li>
		</ul>
	</section>

	<section class="no-print">
		<h2>Spam call blocker questions</h2>
		{#each faqs as faq}
			<h3>{faq.q}</h3>
			<p>{faq.a}</p>
		{/each}
	</section>
</article>
