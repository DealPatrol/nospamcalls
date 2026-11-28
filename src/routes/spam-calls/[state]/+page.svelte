<script lang="ts">
	import Breadcrumbs from '#lib/components/Breadcrumbs.svelte';
	import Disclaimer from '#lib/components/Disclaimer.svelte';
	import SeoHead from '#lib/components/SeoHead.svelte';
	import TopicCta from '#lib/components/TopicCta.svelte';
	import EmailCaptureBar from '#lib/components/EmailCaptureBar.svelte';
	import { AREA_CODE_SOURCE } from '#lib/data/area-codes';
	import { STATE_RESOURCES, STATE_SPAM_CHECKED, statePrivacyLaw } from '#lib/content/state-spam';
	import { e164ToSlug, formatNational } from '#lib/phone';
	import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, howToJsonLd, type Crumb } from '#lib/seo';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const st = $derived(data.state);
	const s = $derived(data.summary);
	const law = $derived(statePrivacyLaw(st.abbr));
	const local = $derived(STATE_RESOURCES[st.abbr] ?? null);
	const codeList = $derived(data.codes.map((c) => c.npa).join(', '));
	const fmt = (n: number) => n.toLocaleString('en-US');
	const path = $derived(`/spam-calls/${st.slug}`);
	const title = $derived(`${st.name} spam calls: top reported numbers & area codes`);
	const description = $derived(
		`Most-reported spam numbers in FTC/FCC complaints from ${st.name}, its area codes, and free steps to block and report robocalls.`
	);
	const crumbs: Crumb[] = $derived([
		{ href: '/', label: 'Home' },
		{ href: '/spam-calls', label: 'Spam calls by state' },
		{ href: path, label: st.name }
	]);
	const steps = $derived([
		{
			name: 'Register on the Do Not Call Registry',
			text: 'Add your number at donotcall.gov or call 1-888-382-1222. It stops most legal sales calls; scammers ignore it, so keep going.'
		},
		{
			name: 'Turn on built-in call screening',
			text: 'On iPhone, use Screen Unknown Callers in the Phone settings. On Android, turn on spam protection and Call Screen in the Google Phone app if your phone offers it.'
		},
		{
			name: 'Turn on your carrier’s free spam filter',
			text: 'Turn on AT&T ActiveArmor, Verizon Call Filter, T-Mobile Scam Shield, or your carrier’s equivalent. Our setup wizard has the steps.'
		},
		{
			name: 'Block the worst offenders at once',
			text: 'Download the free Top-100 blocklist as one contact card and block it in one tap.'
		},
		{
			name: 'Report the call',
			text: `Report to the FTC at reportfraud.ftc.gov or the FCC at fcc.gov/complaints${local ? `, and to the ${st.name} Attorney General` : ''}. Your report helps the next person who looks the number up.`
		}
	]);
	const faqs = $derived([
		{
			q: `Why do I get so many spam calls with ${st.name} area codes?`,
			a: `Scammers often spoof a local-looking number, sometimes called neighbor spoofing, because people are more likely to answer a local call. A ${codeList} number on caller ID does not prove the caller is in ${st.name}.`
		},
		{
			q: `How do I report spam calls in ${st.name}?`,
			a: local
				? `Report to the FTC at reportfraud.ftc.gov and the FCC at fcc.gov/complaints. In ${st.name}, you can also use the Attorney General’s consumer complaint form listed on this page.`
				: `Report to the FTC at reportfraud.ftc.gov and the FCC at fcc.gov/complaints. Your state attorney general’s consumer protection office also takes complaints.`
		},
		{
			q: `Does ${st.name} have its own Do Not Call list?`,
			a:
				st.abbr === 'AL'
					? 'Alabama has adopted the National Do Not Call Registry and merged its own register with the FTC’s list, according to the Alabama Public Service Commission. Register at donotcall.gov.'
					: 'Every U.S. number can use the National Do Not Call Registry at donotcall.gov. Some states also keep their own list; check your state attorney general or utility commission.'
		},
		{
			q: 'Where do these numbers come from?',
			a: 'From the FCC Consumer Complaints open dataset (unwanted calls) and the FTC Do Not Call Reported Calls data, refreshed daily. A number is counted for a state when the most recent complaint about it came from someone in that state. These are unverified consumer reports, and caller ID can be spoofed.'
		}
	]);
	const jsonLd = $derived([
		breadcrumbJsonLd(data.origin, crumbs),
		articleJsonLd({ origin: data.origin, path, headline: title, description }),
		howToJsonLd({ name: `How to stop spam calls in ${st.name}`, description, steps }),
		faqJsonLd(faqs)
	]);
</script>

<SeoHead {title} {description} canonical={`${data.origin}${path}`} {jsonLd} />
<Breadcrumbs {crumbs} />

<article class="prose">
	<h1>Spam calls in {st.name}</h1>
	<div class="answer-box">
		<p class="answer-label">In short</p>
		<p>
			To cut spam calls in {st.name}: register at donotcall.gov, turn on your phone’s call screening
			and your carrier’s free spam filter, block the most-reported numbers, and report the rest to
			the FTC or FCC.
		</p>
		{#if s.numbers}
			<p>
				In our copy of FTC and FCC unwanted-call complaints, {fmt(s.numbers)} caller number{s.numbers ===
				1
					? ''
					: 's'}
				were most recently reported by someone in {st.name}, across {fmt(s.complaints)} complaint{s.complaints ===
				1
					? ''
					: 's'}.
			</p>
		{/if}
	</div>

	<EmailCaptureBar
		headline={`Get the free Top-100 spam blocklist for your phone`}
		sub={`One contact card with the most-reported active numbers, including ones reported from ${st.name}. One email, unsubscribe anytime.`}
		leadMagnet="home_blocklist"
		contextValue={st.abbr}
		button="Send it free"
	/>
	<Disclaimer />

	{#if s.top.length}
		<h2>Most-reported numbers from {st.name} complaints</h2>
		<div class="table-wrap">
			<table class="data-table">
				<thead><tr><th>Number</th><th>FTC + FCC complaints</th><th>Latest topic</th></tr></thead>
				<tbody>
					{#each s.top as n}
						<tr>
							<td><a href="/number/{e164ToSlug(n.e164)}">{formatNational(n.e164)}</a></td>
							<td>{n.total_gov_count}</td>
							<td>{n.top_subject ?? '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="muted">
			Counted by the consumer’s state on the latest complaint for each number. Source: FCC Consumer
			Complaints open data and the FTC Do Not Call Reported Calls API. Unverified reports; caller ID
			can be spoofed.
			<a href="/spam-call-data">National data index</a>.
		</p>
	{:else}
		<p>
			No federal complaint data for {st.name} is loaded right now. Look up any number on the
			<a href="/">home page</a>.
		</p>
	{/if}

	{#if s.subjects.length}
		<h2>What {st.name} callers complain about</h2>
		<ul>
			{#each s.subjects as subj}
				<li>
					{subj.label}: {fmt(subj.numbers)} number{subj.numbers === 1 ? '' : 's'}, {fmt(
						subj.complaints
					)} complaint{subj.complaints === 1 ? '' : 's'}
				</li>
			{/each}
		</ul>
		<p class="muted">
			Topic of the latest complaint for each number, as the consumer chose it on the FTC or FCC
			form.
		</p>
	{/if}

	<h2>{st.name} area codes</h2>
	<p>
		NANPA lists {data.codes.length} in-service geographic area code{data.codes.length === 1
			? ''
			: 's'} for {st.name}. Spammers often spoof these to look local.
	</p>
	<div class="table-wrap">
		<table class="data-table">
			<thead>
				<tr><th>Area code</th><th>In service since (NANPA)</th><th>Reported caller numbers</th></tr>
			</thead>
			<tbody>
				{#each data.codes as c}
					{@const hit = s.areaCodes.find((a) => a.npa === c.npa)}
					<tr>
						<td><a href="/area-code/{c.npa}">{c.npa}</a>{c.overlay ? ' (overlay)' : ''}</td>
						<td>{c.inServiceDate || '—'}</td>
						<td>{hit ? `${fmt(hit.numbers)} numbers, ${fmt(hit.complaints)} complaints` : '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="muted">
		Numbering facts: <a href={AREA_CODE_SOURCE.url} rel="noopener noreferrer">
			{AREA_CODE_SOURCE.name}
		</a>, file date
		{AREA_CODE_SOURCE.fileDate}. Reported counts are caller numbers in federal complaints that start
		with each code, from anywhere in the U.S.
	</p>

	{#if local}
		<h2>{st.name} rules and where to report</h2>
		<p>{local.intro}</p>
		<ul>
			{#each local.resources as r}
				<li><a href={r.href} rel="noopener noreferrer">{r.label}</a>. {r.note}</li>
			{/each}
		</ul>
		<p class="muted">Checked on the official pages on {STATE_SPAM_CHECKED}. Not legal advice.</p>
	{/if}

	<h2>How to stop spam calls in {st.name}</h2>
	<ol>
		{#each steps as step, i}
			<li id="step-{i + 1}"><strong>{step.name}.</strong> {step.text}</li>
		{/each}
	</ol>
	<p>
		Step-by-step phone and carrier settings are in the <a href="/setup">setup wizard</a>. For a
		parent’s phone, print the
		<a href="/family-setup">family anti-scam kit</a>. Got a suspicious text? Use the
		<a href="/text-scam-check">scam text checker</a>.
	</p>

	<h2>Your data and people-search sites</h2>
	{#if law}
		<p>
			{st.name} has a comprehensive privacy law, the {law.name} ({law.abbr}, {law.cite}), effective {law.effective}.
			You can use it to ask companies to delete your data. The
			<a href="/exposure-check">exposure check</a> prints a deletion packet.
		</p>
	{:else}
		<p>
			{st.name} does not have a comprehensive consumer privacy law in our list, but people-search sites
			still offer opt-outs. Use the <a href="/opt-out">data-broker opt-out kit</a> to remove your number
			from 14 of them.
		</p>
	{/if}

	<h2>Can you get paid for robocalls in {st.name}?</h2>
	<p>
		Sometimes. The federal Telephone Consumer Protection Act allows statutory damages of $500 per
		illegal call, up to $1,500 if willful. Those are legal maximums, not guaranteed recoveries. See <a
			href="/get-paid"
		>
			open settlements and the free evidence kit
		</a>.
	</p>

	<TopicCta
		variant="business"
		heading={`Run a business in ${st.name}?`}
		body="Blocking spam should not mean missing customer calls. See how to filter spam and still catch every job call."
		href="/business/missed-customer-calls"
		label="Block spam without missing customers"
	/>

	<h2>FAQ</h2>
	{#each faqs as f}
		<h3>{f.q}</h3>
		<p>{f.a}</p>
	{/each}

	<p class="muted">
		<a href="/spam-calls">All states</a> · <a href="/area-code">All area codes</a>
	</p>
</article>
