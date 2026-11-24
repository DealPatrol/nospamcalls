import { resolve4 } from 'node:dns/promises';
import { findPhoneNumbersInText } from 'libphonenumber-js';
import { getGovNumber, validUsNumber } from './gov';

/**
 * Scam text (smishing) analyzer. The message is analyzed in memory only and never stored or logged.
 * It never visits the suspicious link: it only asks public RDAP (rdap.org) for the domain's registration date
 * and public DNS whether the domain resolves.
 */

export type TextFlag = { level: 'high' | 'medium' | 'info'; text: string };
export type LinkReport = {
	url: string;
	host: string;
	domain: string;
	registeredAt: string | null;
	ageDays: number | null;
	registrar: string | null;
	resolves: boolean | null;
	officialFor: string | null;
	flags: TextFlag[];
};
export type PhoneReport = { e164: string; govCount: number; topSubject: string | null; lastReportedAt: string | null };
export type TextScan = {
	verdict: 'likely_scam' | 'suspicious' | 'no_red_flags';
	score: number;
	flags: TextFlag[];
	links: LinkReport[];
	phones: PhoneReport[];
	brands: string[];
	nextSteps: string[];
};

/** Brands most impersonated in U.S. scam texts, with the domains they actually use. */
const BRANDS: { name: string; keywords: string[]; domains: string[] }[] = [
	{ name: 'USPS', keywords: ['usps', 'postal service', 'post office', 'redelivery', 're-delivery'], domains: ['usps.com', 'usps.gov', 'uspis.gov'] },
	{ name: 'UPS', keywords: ['ups package', 'ups delivery', 'ups shipment', 'ups parcel'], domains: ['ups.com'] },
	{ name: 'FedEx', keywords: ['fedex'], domains: ['fedex.com'] },
	{ name: 'DHL', keywords: ['dhl'], domains: ['dhl.com'] },
	{ name: 'Amazon', keywords: ['amazon', 'amzn', 'prime membership'], domains: ['amazon.com', 'amzn.to', 'a.co'] },
	{ name: 'Apple', keywords: ['apple id', 'apple pay', 'icloud', 'apple account'], domains: ['apple.com', 'icloud.com'] },
	{ name: 'IRS', keywords: ['irs', 'internal revenue', 'tax refund'], domains: ['irs.gov'] },
	{ name: 'Social Security', keywords: ['social security', 'ssa'], domains: ['ssa.gov'] },
	{ name: 'Toll agency', keywords: ['toll', 'e-zpass', 'ezpass', 'sunpass', 'fastrak', 'txtag', 'peach pass', 'i-pass', 'ipass', 'the toll roads'], domains: ['e-zpassny.com', 'ezpassnj.com', 'ezpassva.com', 'ezpassmd.com', 'sunpass.com', 'bayareafastrak.org', 'thetollroads.com', 'txtag.org', 'ntta.org', 'peachpass.com', 'getipass.com'] },
	{ name: 'DMV', keywords: ['dmv', 'department of motor vehicles', 'traffic ticket', 'driver license'], domains: ['dmv.ca.gov', 'dmv.ny.gov', 'txdmv.gov', 'flhsmv.gov'] },
	{ name: 'PayPal', keywords: ['paypal'], domains: ['paypal.com'] },
	{ name: 'Venmo', keywords: ['venmo'], domains: ['venmo.com'] },
	{ name: 'Zelle', keywords: ['zelle'], domains: ['zellepay.com'] },
	{ name: 'Cash App', keywords: ['cash app', 'cashapp'], domains: ['cash.app', 'cash.me'] },
	{ name: 'Chase', keywords: ['chase'], domains: ['chase.com'] },
	{ name: 'Bank of America', keywords: ['bank of america', 'bofa'], domains: ['bankofamerica.com', 'bofa.com'] },
	{ name: 'Wells Fargo', keywords: ['wells fargo', 'wellsfargo'], domains: ['wellsfargo.com', 'wf.com'] },
	{ name: 'Netflix', keywords: ['netflix'], domains: ['netflix.com'] },
	{ name: 'Microsoft', keywords: ['microsoft', 'outlook account', 'office 365'], domains: ['microsoft.com', 'live.com', 'office.com'] },
	{ name: 'Verizon', keywords: ['verizon'], domains: ['verizon.com', 'vzw.com'] },
	{ name: 'AT&T', keywords: ['at&t', 'att'], domains: ['att.com'] },
	{ name: 'T-Mobile', keywords: ['t-mobile', 'tmobile'], domains: ['t-mobile.com'] },
	{ name: 'Coinbase', keywords: ['coinbase'], domains: ['coinbase.com'] }
];

const SHORTENERS = new Set([
	'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly', 'shorturl.at', 'tiny.cc',
	'rb.gy', 'bl.ink', 't.ly', 'v.gd', 's.id', 'lnkd.in', 'qrco.de', 'shorturl.com', 'urlz.fr', 'clck.ru', 'u.to'
]);

/** Two-level public suffixes common in links (a small list; good enough to find the registrable domain). */
const SECOND_LEVEL = new Set(['co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'com.au', 'net.au', 'org.au', 'co.nz', 'co.jp', 'com.br', 'com.mx', 'co.in', 'co.za', 'com.cn', 'com.hk', 'com.sg', 'com.tr', 'com.ar', 'ca.gov', 'ny.gov', 'state.us']);

const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<>"']+|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,24}|xn--[a-z0-9-]{2,59})(?:\/[^\s<>"']*)?)/gi;
const FILE_LIKE = /\.(?:jpg|jpeg|png|gif|pdf|txt|doc|docx|mp3|mp4)$/i;

export function registrableDomain(host: string): string {
	const parts = host.toLowerCase().replace(/\.$/, '').split('.');
	if (parts.length <= 2) return parts.join('.');
	const last2 = parts.slice(-2).join('.');
	if (SECOND_LEVEL.has(last2)) return parts.slice(-3).join('.');
	return last2;
}

function levenshtein(a: string, b: string): number {
	const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		let prev = dp[0];
		dp[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const tmp = dp[j];
			dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
			prev = tmp;
		}
	}
	return dp[b.length];
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}/gi;

export function extractLinks(text: string): { url: string; host: string }[] {
	const out = new Map<string, { url: string; host: string }>();
	const cleaned = text.replace(EMAIL_RE, ' ');
	for (const m of cleaned.matchAll(URL_RE)) {
		const raw = m[1].replace(/[),.;:!?\]]+$/, '');
		if (FILE_LIKE.test(raw) && !raw.includes('/')) continue;
		const withScheme = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
		try {
			const u = new URL(withScheme);
			const host = u.hostname.toLowerCase();
			if (!host.includes('.')) continue;
			const tld = host.split('.').pop() ?? '';
			if (!/^[a-z]{2,24}$|^xn--/.test(tld)) continue;
			// Bare words like "Mr.Smith" or "e.g" are not links unless they had a scheme or www.
			if (!/^(https?:\/\/|www\.)/i.test(raw) && !KNOWN_TLD.test(tld) && !tld.startsWith('xn--')) continue;
			if (!out.has(host + u.pathname)) out.set(host + u.pathname, { url: raw.slice(0, 300), host });
		} catch {
			/* not a URL */
		}
		if (out.size >= 6) break;
	}
	return [...out.values()];
}

/** TLDs accepted for scheme-less links (covers the TLDs that show up in U.S. scam texts and everyday links). */
const KNOWN_TLD =
	/^(com|net|org|gov|edu|mil|us|io|co|info|biz|me|app|dev|xyz|top|site|online|shop|store|club|vip|live|link|click|icu|cc|tk|ml|ga|cf|gq|cn|ru|ly|to|gd|in|uk|ca|au|de|fr|es|it|nl|br|mx|win|bid|loan|work|life|world|today|support|help|services|cloud|digital|tech|space|website|fun|buzz|rest|cyou|sbs|cfd|bond|quest|hair|lat|pro|mobi|asia|ws|su|pw|one|ink|page|news|net|tv|fm|am|is|ai|gg|sh|run|zip|mov)$/;

function tokens(s: string): string[] {
	return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function brandInAddress(host: string, url: string, b: (typeof BRANDS)[number]): boolean {
	const toks = tokens(`${host} ${url}`);
	return b.keywords.some((k) => {
		const key = k.replace(/[^a-z0-9]/g, '');
		if (key.length < 4 || k.includes(' ')) return false;
		return toks.some((t) => t === key || t.startsWith(key) || (key.length >= 6 && t.includes(key)));
	});
}

async function rdapDomain(domain: string): Promise<{ registeredAt: string | null; registrar: string | null; found: boolean | null }> {
	try {
		const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
			headers: { accept: 'application/rdap+json, application/json', 'user-agent': 'NoSpamCalls/1.0 (+https://nospamcalls.org)' },
			redirect: 'follow',
			signal: AbortSignal.timeout(5000)
		});
		if (res.status === 404) return { registeredAt: null, registrar: null, found: false };
		if (!res.ok) return { registeredAt: null, registrar: null, found: null };
		const data = (await res.json()) as {
			events?: { eventAction?: string; eventDate?: string }[];
			entities?: { roles?: string[]; vcardArray?: [string, [string, unknown, string, string][]] }[];
		};
		const reg = data.events?.find((e) => e.eventAction === 'registration')?.eventDate ?? null;
		const registrarEntity = data.entities?.find((e) => e.roles?.includes('registrar'));
		const fn = registrarEntity?.vcardArray?.[1]?.find((v) => v[0] === 'fn')?.[3] ?? null;
		return { registeredAt: reg, registrar: typeof fn === 'string' ? fn : null, found: true };
	} catch {
		return { registeredAt: null, registrar: null, found: null };
	}
}

async function resolves(host: string): Promise<boolean | null> {
	try {
		const addrs = await Promise.race([
			resolve4(host),
			new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))
		]);
		// 198.18.0.0/15 is a benchmarking range some sandboxed resolvers return for every name; treat as unknown.
		if (addrs.every((a) => /^198\.1[89]\./.test(a))) return null;
		return addrs.length > 0;
	} catch (err) {
		const code = (err as { code?: string }).code;
		if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'ESERVFAIL') return false;
		return null;
	}
}

function brandsIn(text: string): typeof BRANDS {
	const t = text.toLowerCase();
	return BRANDS.filter((b) =>
		b.keywords.some((k) => new RegExp(`(^|[^a-z0-9])${k.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(t))
	);
}

function officialBrand(domain: string): string | null {
	for (const b of BRANDS) if (b.domains.includes(domain)) return b.name;
	if (domain.endsWith('.gov') || domain.endsWith('.mil')) return 'U.S. government (.gov)';
	return null;
}

async function analyzeLink(link: { url: string; host: string }, mentioned: typeof BRANDS): Promise<LinkReport> {
	const domain = registrableDomain(link.host);
	const flags: TextFlag[] = [];
	const official = officialBrand(domain);
	const isShortener = SHORTENERS.has(domain) || SHORTENERS.has(link.host);

	if (/^\d{1,3}(\.\d{1,3}){3}$/.test(link.host)) flags.push({ level: 'high', text: 'The link points to a raw IP address instead of a company website.' });
	if (link.host.split('.').some((p) => p.startsWith('xn--'))) flags.push({ level: 'high', text: 'The web address uses punycode (xn--), which can disguise look-alike characters from other alphabets.' });
	if (isShortener) flags.push({ level: 'medium', text: `${domain} is a link shortener — it hides the real destination.` });

	if (!official && !isShortener) {
		const label = domain.split('.')[0];
		for (const b of BRANDS) {
			const brandHit = brandInAddress(link.host, link.url, b);
			const look = b.domains.some((d) => {
				const dl = d.split('.')[0];
				if (dl.length < 4 || label === dl) return false;
				const dist = levenshtein(label, dl);
				return dl.length >= 7 ? dist <= 2 : dist === 1;
			});
			if (brandHit) {
				const generic = b.name === 'Toll agency' || b.name === 'DMV';
				flags.push({
					level: 'high',
					text: generic
						? `The address looks like a ${b.name === 'DMV' ? 'DMV' : 'toll agency'} site, but ${domain} is not an official ${b.name === 'DMV' ? 'DMV (.gov)' : 'toll agency'} domain (real examples: ${b.domains.slice(0, 2).join(', ')}).`
						: `The address mentions “${b.name}” but ${domain} is not a domain ${b.name} uses (${b.domains.slice(0, 2).join(', ')}).`
				});
				break;
			}
			if (look) {
				flags.push({ level: 'high', text: `${domain} is one or two letters away from ${b.domains[0]} — a look-alike domain.` });
				break;
			}
		}
		if (mentioned.length && !flags.some((f) => f.level === 'high')) {
			flags.push({ level: 'medium', text: `The message mentions ${mentioned.map((b) => b.name).join(', ')}, but the link goes to ${domain}, not an official domain.` });
		}
	}
	if (link.host.split('.').length >= 5) flags.push({ level: 'medium', text: 'The link has an unusually long chain of subdomains, a common way to bury the real domain.' });

	const [rdap, dns] = await Promise.all([official || isShortener ? Promise.resolve(null) : rdapDomain(domain), resolves(link.host)]);
	let ageDays: number | null = null;
	if (rdap?.registeredAt) {
		ageDays = Math.floor((Date.now() - new Date(rdap.registeredAt).getTime()) / 86400000);
		if (ageDays < 30) flags.push({ level: 'high', text: `${domain} was registered only ${ageDays} day${ageDays === 1 ? '' : 's'} ago (${rdap.registeredAt.slice(0, 10)}). Scam sites are usually brand-new.` });
		else if (ageDays < 180) flags.push({ level: 'medium', text: `${domain} was registered ${ageDays} days ago (${rdap.registeredAt.slice(0, 10)}) — under 6 months old.` });
		else flags.push({ level: 'info', text: `${domain} was registered on ${rdap.registeredAt.slice(0, 10)} (${Math.round(ageDays / 365 * 10) / 10} years ago).` });
	} else if (rdap && rdap.found === false) {
		flags.push({ level: 'medium', text: `No registration record found for ${domain} — it may already be taken down or never existed.` });
	}
	if (dns === false) flags.push({ level: 'info', text: `${link.host} does not currently resolve in DNS (it may have been taken down).` });
	if (official) flags.push({ level: 'info', text: `${domain} is an official domain for ${official}. Still check that the message is something you expected.` });

	return { url: link.url, host: link.host, domain, registeredAt: rdap?.registeredAt ?? null, ageDays, registrar: rdap?.registrar ?? null, resolves: dns, officialFor: official, flags };
}

const CONTENT_RULES: { re: RegExp; level: TextFlag['level']; text: string }[] = [
	{ re: /\b(unpaid|outstanding|overdue)\b.{0,40}\b(toll|tolls|balance|invoice|fee|fine)\b|\btoll\b.{0,60}\b(pay|due|fee|penalt)/i, level: 'high', text: 'Unpaid toll or fee demand — the FBI and FTC have warned about mass “unpaid toll” scam texts.' },
	{ re: /\b(redeliver|re-deliver|delivery (attempt|failed|suspended)|package (is )?(on hold|held|could not be delivered)|incomplete address|update (your )?(address|delivery))/i, level: 'high', text: 'Package “could not be delivered / update your address” — USPS says it does not text tracking updates with links unless you requested them.' },
	{ re: /\b(account|card|apple id|profile)\b.{0,40}\b(locked|suspended|disabled|restricted|on hold|deactivated)\b/i, level: 'high', text: 'Claims your account or card is locked or suspended.' },
	{ re: /\b(verify|confirm|update)\b.{0,30}\b(identity|account|payment|billing|card|ssn|social security)\b/i, level: 'medium', text: 'Asks you to verify an account, payment, or identity details.' },
	{ re: /\b(within|in) (24|48|12) ?(hours|hrs|h)\b|\b(immediately|urgent|final notice|last chance|act now|today only|avoid (late )?(fees|penalt|suspension))/i, level: 'medium', text: 'Pressure to act fast (deadline, “final notice,” penalties).' },
	{ re: /\b(gift ?cards?|itunes card|google play card|steam card)\b/i, level: 'high', text: 'Mentions gift cards — no real agency or business asks to be paid in gift cards.' },
	{ re: /\b(bitcoin|crypto|usdt|btc|eth|wallet address|investment opportunity|guaranteed (return|profit))/i, level: 'high', text: 'Crypto or “guaranteed return” investment pitch.' },
	{ re: /\b(you('ve| have)? won|winner|claim your (prize|reward)|free (iphone|gift)|selected to receive)/i, level: 'high', text: 'Prize or reward you didn’t enter for.' },
	{ re: /\b(reply|respond|text back)\b.{0,15}\b(y|yes|1)\b/i, level: 'medium', text: 'Asks you to reply “Y” or a number — replying confirms your number is active and can make your phone enable a blocked link.' },
	{ re: /\b(wrong number|sorry,? (is this|who is)|is this \w+\?)/i, level: 'medium', text: '“Wrong number” opener — a common start to romance and crypto (pig-butchering) scams.' },
	{ re: /\b(job offer|remote (job|position)|earn \$?\d+.{0,20}(per|a) (day|hour)|part[- ]time.{0,20}(\$|earn))/i, level: 'high', text: 'Unsolicited job offer with easy pay — a common task/employment scam.' },
	{ re: /\b(irs|tax refund|stimulus)\b/i, level: 'medium', text: 'Mentions the IRS or a refund — the IRS says it does not start contact by text to ask for personal or financial information.' },
	{ re: /\b(otp|one[- ]time (code|passcode)|verification code)\b.{0,60}\b(share|send|tell|give)\b|\b(share|send|tell|give)\b.{0,40}\b(code)\b/i, level: 'high', text: 'Asks you to share a verification code — never share one-time codes with anyone.' },
	{ re: /\b(traffic (ticket|violation)|citation|license suspension)\b/i, level: 'medium', text: 'Traffic ticket or license threat — a recurring scam-text theme.' }
];

export async function scanText(input: { message: string; sender?: string | null }): Promise<TextScan> {
	const message = input.message.slice(0, 5000);
	const sender = (input.sender ?? '').trim().slice(0, 120);
	const flags: TextFlag[] = [];

	for (const rule of CONTENT_RULES) if (rule.re.test(message)) flags.push({ level: rule.level, text: rule.text });

	if (sender) {
		if (/@/.test(sender)) flags.push({ level: 'medium', text: 'Sent from an email address instead of a phone number — mass scam texts are often sent this way through iMessage/RCS.' });
		else {
			const digits = sender.replace(/\D/g, '');
			if (/^\d{5,6}$/.test(digits)) flags.push({ level: 'info', text: 'Sent from a short code. Real companies use short codes, but scammers spoof brand names in the message text — check the link.' });
			else if (digits.length > 11 || (digits.length === 11 && !digits.startsWith('1')) || (sender.startsWith('+') && !sender.startsWith('+1'))) flags.push({ level: 'medium', text: 'Sent from an international number while claiming to be a U.S. company or agency.' });
		}
	}

	const mentioned = brandsIn(message);
	const links = extractLinks(message);
	const linkReports = await Promise.all(links.map((l) => analyzeLink(l, mentioned)));

	// Phones in the message body + the sender.
	const phoneSet = new Set<string>();
	try {
		for (const p of findPhoneNumbersInText(`${message}\n${sender}`, 'US')) {
			const e164 = validUsNumber(p.number.number);
			if (e164) phoneSet.add(e164);
		}
	} catch {
		/* ignore */
	}
	const s164 = validUsNumber(sender);
	if (s164) phoneSet.add(s164);
	const phones: PhoneReport[] = [];
	await Promise.all(
		[...phoneSet].slice(0, 5).map(async (e164) => {
			try {
				const g = await getGovNumber(e164);
				phones.push({ e164, govCount: g?.total_gov_count ?? 0, topSubject: g?.top_subject ?? null, lastReportedAt: g?.last_reported_at ?? null });
				if (g && g.total_gov_count > 0) flags.push({ level: g.total_gov_count >= 3 ? 'high' : 'medium', text: `${e164} appears in ${g.total_gov_count} FTC/FCC complaint${g.total_gov_count === 1 ? '' : 's'}${g.top_subject ? ` (${g.top_subject})` : ''}.` });
			} catch {
				phones.push({ e164, govCount: 0, topSubject: null, lastReportedAt: null });
			}
		})
	);

	if (!links.length && !phones.length && !flags.length) flags.push({ level: 'info', text: 'No links, phone numbers, or common scam phrases found.' });

	const all = [...flags, ...linkReports.flatMap((l) => l.flags)];
	const score = Math.min(100, all.reduce((s, f) => s + (f.level === 'high' ? 30 : f.level === 'medium' ? 12 : 0), 0));
	const highs = all.filter((f) => f.level === 'high').length;
	const linkHigh = linkReports.some((l) => l.flags.some((f) => f.level === 'high'));
	const verdict: TextScan['verdict'] =
		linkHigh || highs >= 2 || (highs >= 1 && score >= 40) ? 'likely_scam' : score >= 12 ? 'suspicious' : 'no_red_flags';

	const nextSteps = [
		'Do not tap the link or reply (not even STOP) if you don’t recognize the sender.',
		'Forward the text to 7726 (SPAM) so your carrier can block the sender, then delete it.',
		'If it claims to be a company or agency, contact them using the app or a number you already trust — never one from the text.',
		'Report it to the FTC at ReportFraud.ftc.gov. If you lost money, also file at ic3.gov and call your bank right away.'
	];
	if (mentioned.some((b) => b.name === 'USPS')) nextSteps.push('USPS scam texts can be reported to the U.S. Postal Inspection Service (forward to 7726 and see uspis.gov).');
	if (mentioned.some((b) => b.name === 'IRS')) nextSteps.push('The IRS asks people to report IRS-themed scam texts; see irs.gov “Report phishing.”');

	return {
		verdict,
		score,
		flags,
		links: linkReports,
		phones,
		brands: mentioned.map((b) => b.name),
		nextSteps
	};
}
