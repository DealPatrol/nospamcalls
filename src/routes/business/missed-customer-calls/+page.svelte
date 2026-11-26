<script lang="ts">
	import SeoHead from '#lib/components/SeoHead.svelte';
	import { absoluteUrl } from '#lib/site';

	const path = '/business/missed-customer-calls';
	const canonical = absoluteUrl(path);
	const title = 'Block spam calls without missing customers (small business guide)';
	const description =
		'How a small business can filter spam calls without sending real customers to voicemail: free carrier filters, a missed-call cost check, and when an AI receptionist makes sense.';

	const ER_URL =
		'https://executivereceptionist.com/receptionist/packages?utm_source=nospamcalls&utm_medium=referral&utm_campaign=missed-customer-calls';
	const ER_DEMO =
		'https://executivereceptionist.com/receptionist/book-a-demo?utm_source=nospamcalls&utm_medium=referral&utm_campaign=missed-customer-calls';

	const alabamaCodes = [
		{ npa: '205', area: 'Birmingham, Tuscaloosa' },
		{ npa: '659', area: 'Birmingham, Tuscaloosa (overlay)' },
		{ npa: '256', area: 'Huntsville, Decatur, Gadsden, Florence, Cullman' },
		{ npa: '938', area: 'North Alabama (overlay of 256)' },
		{ npa: '334', area: 'Montgomery, Auburn, Dothan' },
		{ npa: '251', area: 'Mobile, Baldwin County' }
	];

	const faqs = [
		{
			q: 'How can a small business block spam calls without missing customers?',
			a: 'Turn on your carrier’s free spam filter so only calls it rates as likely fraud are blocked, and send everything else to a line that always answers: you, a staff member, or an answering service. Avoid “silence all unknown callers” on a business line, because most new customers are unknown numbers.'
		},
		{
			q: 'Should I use “Silence Unknown Callers” on my business phone?',
			a: 'Usually not. It sends every number not in your contacts to voicemail, and first-time customers are by definition not in your contacts. Many callers hang up instead of leaving a message.'
		},
		{
			q: 'What does a missed customer call cost?',
			a: 'It depends on your own numbers. Multiply the real customer calls you miss each week by how many of them would book and by your typical job value. The calculator on this page does that arithmetic; it is an example, not a forecast.'
		},
		{
			q: 'Will an AI receptionist answer spam calls too?',
			a: 'An answering service picks up whatever reaches it, so spam calls may get answered as well. The difference is that real customers get answered and their details are written down for you, and you skip calling back the junk.'
		},
		{
			q: 'My own business number shows as “Scam Likely.” What do I do?',
			a: 'Request a free check on the NoSpamCalls business page, and use the carrier and FCC steps linked there. Nobody can promise a label will be cleared.'
		}
	];

	let unknownPerWeek = $state(20);
	let realShare = $state(40);
	let ignoredShare = $state(50);
	let bookOneIn = $state(3);
	let jobValue = $state(300);

	const clamp = (n: number, lo: number, hi: number) =>
		Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;
	const missedReal = $derived(
		Math.round(
			clamp(unknownPerWeek, 0, 2000) *
				(clamp(realShare, 0, 100) / 100) *
				(clamp(ignoredShare, 0, 100) / 100) *
				10
		) / 10
	);
	const monthly = $derived(
		Math.round((missedReal / clamp(bookOneIn, 1, 100)) * clamp(jobValue, 0, 100000) * (52 / 12))
	);
	const usd = (n: number) =>
		n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

	const jsonLd = [
		{
			'@context': 'https://schema.org',
			'@type': 'HowTo',
			name: 'How to block spam calls on a business line without missing customers',
			url: canonical,
			step: [
				{
					'@type': 'HowToStep',
					name: 'Turn on the carrier filter',
					text: 'Enable your carrier’s free spam filter and set it to block only likely fraud, not every unknown number.'
				},
				{
					'@type': 'HowToStep',
					name: 'Keep unknown callers ringing',
					text: 'Leave “silence unknown callers” off on the business line; new customers are unknown numbers.'
				},
				{
					'@type': 'HowToStep',
					name: 'Cover the calls you cannot take',
					text: 'Forward unanswered and after-hours calls to a person or an answering service that takes the caller’s details.'
				},
				{
					'@type': 'HowToStep',
					name: 'Check your own number',
					text: 'If customers say your number shows as Scam Likely, request a free check and follow carrier and FCC steps.'
				}
			]
		},
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: faqs.map((f) => ({
				'@type': 'Question',
				name: f.q,
				acceptedAnswer: { '@type': 'Answer', text: f.a }
			}))
		}
	];
</script>

<SeoHead {title} {description} {canonical} {jsonLd} />

<article class="ed">
	<p class="kicker">For small businesses · Spam vs. customers</p>
	<h1>Block the spam. <em>Keep the customers.</em></h1>
	<p class="answer">
		The short answer: use your carrier’s free spam filter to block likely fraud, leave unknown
		callers ringing on your business line, and make sure every call you can’t take reaches someone
		who writes down the caller’s name, number and what they need. Silencing every unknown number
		stops spam, and it stops new customers too.
	</p>

	<section>
		<h2>Four steps that work on any business line</h2>
		<ol class="steps">
			<li>
				<strong>Turn on the carrier filter.</strong> AT&amp;T, Verizon and T-Mobile each offer spam
				call filtering, with a free tier. Set it to block likely fraud only. See
				<a href="/block-spam-calls">our block guides by phone and carrier</a>.
			</li>
			<li>
				<strong>Keep unknown callers ringing.</strong> Leave “Silence Unknown Callers” off on the phone
				customers call. First-time customers are unknown numbers.
			</li>
			<li>
				<strong>Cover the calls you can’t take.</strong> Forward unanswered and after-hours calls to a
				person, a staff member, or an answering service that takes the details.
			</li>
			<li>
				<strong>Check your own number.</strong> If customers say your calls show as “Scam Likely,”
				request a
				<a href="/business">free Scam Likely check</a>.
			</li>
		</ol>
	</section>

	<section class="calc" aria-labelledby="calc-h">
		<h2 id="calc-h">What screening is costing you</h2>
		<p class="note">Your own numbers. It runs in your browser, and nothing is sent anywhere.</p>
		<div class="grid">
			<label>
				Unknown-number calls a week <input type="number" min="0" bind:value={unknownPerWeek} />
			</label>
			<label>
				Share that are real customers (%) <input
					type="number"
					min="0"
					max="100"
					bind:value={realShare}
				/>
			</label>
			<label>
				Share you let go to voicemail (%) <input
					type="number"
					min="0"
					max="100"
					bind:value={ignoredShare}
				/>
			</label>
			<label>
				1 in how many customers books <input type="number" min="1" bind:value={bookOneIn} />
			</label>
			<label>Typical job value ($) <input type="number" min="0" bind:value={jobValue} /></label>
		</div>
		<div class="result" aria-live="polite">
			<p>
				About <strong>{missedReal}</strong> real customer calls a week go unanswered. At 1 in {bookOneIn}
				booking a {usd(jobValue)}
				job, that is roughly <strong>{usd(monthly)} a month</strong>.
			</p>
			<p class="note">Arithmetic on your inputs, not a forecast and not an industry average.</p>
		</div>
	</section>

	<section class="offer">
		<p class="kicker">From the same maker</p>
		<h2>Let an AI receptionist pick up the calls you can’t</h2>
		<p>
			Executive Receptionist is an AI receptionist named Ava, run by Cole Collins, who also runs
			NoSpamCalls. Forward the calls you miss. She says she is an AI receptionist, takes the
			caller’s name, number and what they need, and emails you a summary, so you call back real
			customers and skip the junk. Plans start at $25 a month, Starter is $1 the first month, and
			there are bundles with Google Business Profile care.
		</p>
		<p class="cta">
			<a class="edbtn ink" href={ER_DEMO}>Book a 15-minute demo</a>
			<a class="edbtn ghost" href={ER_URL}>See plans and packages</a>
			<a class="edbtn ghost" href="tel:+12569524935">Hear Ava: (256) 952-4935</a>
		</p>
	</section>

	<section>
		<h2>Alabama business lines</h2>
		<p>
			Spam calls often spoof your own area code. Check what has been reported in Alabama’s area
			codes:
		</p>
		<ul class="codes">
			{#each alabamaCodes as code (code.npa)}
				<li><a href={`/area-code/${code.npa}`}>{code.npa}</a> <span>{code.area}</span></li>
			{/each}
		</ul>
		<p class="note">
			Neighbor-spoofing looks like a local number. Our <a href="/neighbor-spoof">
				neighbor-spoof prefix tool
			</a> explains what to block safely.
		</p>
	</section>

	<section class="faq">
		<h2>Questions</h2>
		{#each faqs as faq (faq.q)}
			<details>
				<summary>{faq.q}</summary>
				<p>{faq.a}</p>
			</details>
		{/each}
	</section>
</article>

<style>
	.ed {
		--paper: #f7f5ef;
		--paper-deep: #eef2ee;
		--ink: #1e2620;
		--ink-soft: #4e5e52;
		--brass: #8cae93;
		--brass-deep: #4e5e52;
		--rule: #e6e2d6;
		background: var(--paper);
		color: var(--ink);
		padding: clamp(20px, 4vw, 48px);
		border: 1px solid var(--rule);
		line-height: 1.6;
	}
	.ed h1,
	.ed h2 {
		font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
		font-weight: 600;
		color: var(--ink);
		letter-spacing: -0.01em;
	}
	.ed h1 {
		font-size: clamp(36px, 6vw, 60px);
		line-height: 1.04;
		margin: 0;
	}
	.ed h1 em {
		color: var(--brass-deep);
	}
	.ed h2 {
		font-size: clamp(26px, 3.4vw, 36px);
		margin: 0 0 10px;
	}
	.ed section {
		margin-top: 36px;
		padding-top: 28px;
		border-top: 1px solid var(--rule);
	}
	.ed a {
		color: var(--brass-deep);
	}
	.kicker {
		margin: 0 0 12px;
		color: var(--brass-deep);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}
	.answer {
		margin: 20px 0 0;
		padding: 16px 20px;
		border-left: 3px solid var(--brass);
		background: var(--paper-deep);
		font-size: 18px;
		max-width: 70ch;
	}
	.steps li {
		margin: 10px 0;
	}
	.note {
		color: var(--ink-soft);
		font-size: 14px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 14px;
		margin-top: 14px;
	}
	.grid label {
		display: grid;
		gap: 6px;
		font-size: 14px;
		font-weight: 600;
	}
	.grid input {
		min-height: 42px;
		padding: 6px 10px;
		border: 1px solid #d6ddd7;
		background: #eef2ee;
		color: var(--ink);
		font: inherit;
	}
	.result {
		margin-top: 16px;
		padding: 14px 18px;
		border-left: 3px solid var(--brass);
		background: var(--paper-deep);
	}
	.result p {
		margin: 4px 0;
	}
	.offer {
		background: #f7f5ef;
		padding: 24px;
		border: 2px solid var(--brass);
	}
	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.edbtn {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 18px;
		border: 1px solid var(--ink);
		border-radius: 2px;
		font-weight: 700;
		text-decoration: none;
	}
	.edbtn.ink {
		background: #e84630;
		border-color: #e84630;
		color: #fff !important;
	}
	.edbtn.ink:hover {
		background: #d13823;
		border-color: #d13823;
	}
	.edbtn.ghost {
		background: transparent;
		color: var(--ink) !important;
	}
	.codes {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 8px;
	}
	.codes a {
		font-family: Georgia, serif;
		font-size: 22px;
		font-weight: 600;
		margin-right: 8px;
	}
	.codes span {
		color: var(--ink-soft);
		font-size: 14px;
	}
	.faq details {
		padding: 12px 0;
		border-bottom: 1px solid var(--rule);
	}
	.faq summary {
		cursor: pointer;
		font-family: Georgia, serif;
		font-size: 19px;
		font-weight: 600;
	}
	.edbtn:focus-visible,
	.grid input:focus-visible,
	.ed a:focus-visible {
		outline: 3px solid var(--brass);
		outline-offset: 2px;
	}
</style>
