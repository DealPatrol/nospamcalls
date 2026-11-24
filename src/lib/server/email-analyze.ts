import { resolveMx, resolveTxt } from 'node:dns/promises';
import { isIP } from 'node:net';

export type HopIp = { ip: string; host: string | null };
export type RdapInfo = { ip: string; network: string | null; org: string | null; country: string | null; abuseEmails: string[]; source: string };
export type DomainInfo = {
	domain: string;
	spf: string | null;
	dmarc: string | null;
	dmarcPolicy: string | null;
	mx: string[];
	error: string | null;
};
export type Analysis = {
	from: string | null;
	fromDomain: string | null;
	returnPath: string | null;
	returnPathDomain: string | null;
	replyTo: string | null;
	replyToDomain: string | null;
	subject: string | null;
	date: string | null;
	messageId: string | null;
	auth: { spf: string | null; dkim: string | null; dmarc: string | null; raw: string | null };
	dkimDomains: string[];
	hops: HopIp[];
	originIp: HopIp | null;
	rdap: RdapInfo | null;
	domains: DomainInfo[];
	listUnsubscribe: string | null;
	oneClickUnsubscribe: boolean;
	flags: { level: 'high' | 'medium' | 'info'; text: string }[];
};

export function parseHeaders(raw: string): Map<string, string[]> {
	const text = raw.replace(/\r\n/g, '\n');
	const headerPart = text.split(/\n\s*\n/)[0];
	const unfolded = headerPart.replace(/\n[ \t]+/g, ' ');
	const map = new Map<string, string[]>();
	for (const line of unfolded.split('\n')) {
		const m = /^([A-Za-z0-9-]+):\s?(.*)$/.exec(line);
		if (!m) continue;
		const name = m[1].toLowerCase();
		map.set(name, [...(map.get(name) ?? []), m[2].trim()]);
	}
	return map;
}

function addressOf(value: string | null | undefined): string | null {
	if (!value) return null;
	const angle = /<([^>]+@[^>]+)>/.exec(value);
	const bare = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/.exec(value);
	return (angle?.[1] ?? bare?.[1] ?? null)?.toLowerCase() ?? null;
}

export function domainOf(address: string | null): string | null {
	if (!address) return null;
	const d = address.split('@')[1]?.toLowerCase().replace(/[>\s]/g, '');
	return d && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) ? d : null;
}

/** Organizational domain approximation (last two labels, or three for common 2-level public suffixes). */
export function orgDomain(domain: string | null): string | null {
	if (!domain) return null;
	const parts = domain.split('.');
	const twoLevel = /^(co|com|net|org|gov|ac|edu)\.[a-z]{2}$/.test(parts.slice(-2).join('.'));
	return parts.slice(twoLevel ? -3 : -2).join('.');
}

export function isPublicIp(ip: string): boolean {
	const v = isIP(ip);
	if (v === 4) {
		const [a, b] = ip.split('.').map(Number);
		if (a === 10 || a === 127 || a === 0 || a >= 224) return false;
		if (a === 172 && b >= 16 && b <= 31) return false;
		if (a === 192 && b === 168) return false;
		if (a === 169 && b === 254) return false;
		if (a === 100 && b >= 64 && b <= 127) return false;
		return true;
	}
	if (v === 6) {
		const x = ip.toLowerCase();
		return !(x === '::1' || x.startsWith('fe80') || x.startsWith('fc') || x.startsWith('fd') || x.startsWith('::ffff:10.') || x === '::');
	}
	return false;
}

function hopsFrom(received: string[]): HopIp[] {
	const hops: HopIp[] = [];
	for (const line of received) {
		const fromPart = /^from\s+(.+?)\s+by\s+/i.exec(line)?.[1] ?? line.split(/\sby\s/i)[0] ?? '';
		const host = /^from\s+([A-Za-z0-9.-]+)/i.exec(line)?.[1] ?? null;
		const candidates = [
			...fromPart.matchAll(/\[(?:IPv6:)?([0-9a-fA-F:.]+)\]/g),
			...fromPart.matchAll(/\(([0-9]{1,3}(?:\.[0-9]{1,3}){3})\)/g),
			...fromPart.matchAll(/\b([0-9]{1,3}(?:\.[0-9]{1,3}){3})\b/g)
		].map((m) => m[1]);
		const ip = candidates.find((c) => isIP(c) && isPublicIp(c));
		if (ip && !hops.some((h) => h.ip === ip)) hops.push({ ip, host });
	}
	return hops;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
	return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

export async function lookupDomain(domain: string): Promise<DomainInfo> {
	const info: DomainInfo = { domain, spf: null, dmarc: null, dmarcPolicy: null, mx: [], error: null };
	const [txt, dmarc, mx] = await Promise.allSettled([
		withTimeout(resolveTxt(domain), 3000),
		withTimeout(resolveTxt(`_dmarc.${domain}`), 3000),
		withTimeout(resolveMx(domain), 3000)
	]);
	if (txt.status === 'fulfilled') info.spf = txt.value.map((r) => r.join('')).find((r) => /^v=spf1/i.test(r)) ?? null;
	if (dmarc.status === 'fulfilled') {
		info.dmarc = dmarc.value.map((r) => r.join('')).find((r) => /^v=DMARC1/i.test(r)) ?? null;
		info.dmarcPolicy = info.dmarc ? (/;\s*p=([a-z]+)/i.exec(info.dmarc)?.[1]?.toLowerCase() ?? null) : null;
	}
	if (mx.status === 'fulfilled') info.mx = mx.value.sort((a, b) => a.priority - b.priority).map((m) => m.exchange).slice(0, 5);
	if (txt.status === 'rejected' && mx.status === 'rejected') info.error = 'No DNS records found (domain may not exist).';
	return info;
}

function collectAbuse(entity: Record<string, unknown>, out: { abuse: string[]; org: string | null }) {
	const roles = (entity.roles as string[]) ?? [];
	const vcard = entity.vcardArray as [string, [string, unknown, string, string][]] | undefined;
	const fields = Array.isArray(vcard?.[1]) ? vcard![1] : [];
	const email = fields.find((f) => f[0] === 'email')?.[3];
	const fn = fields.find((f) => f[0] === 'fn')?.[3];
	if (roles.includes('abuse') && typeof email === 'string') out.abuse.push(email.toLowerCase());
	if (!out.org && (roles.includes('registrant') || roles.includes('administrative')) && typeof fn === 'string') out.org = fn;
	for (const child of (entity.entities as Record<string, unknown>[]) ?? []) collectAbuse(child, out);
}

export async function lookupRdap(ip: string): Promise<RdapInfo | null> {
	for (const base of ['https://rdap.org/ip/', 'https://rdap.arin.net/registry/ip/']) {
		try {
			const res = await fetch(base + encodeURIComponent(ip), {
				headers: { accept: 'application/rdap+json, application/json' },
				signal: AbortSignal.timeout(4000),
				redirect: 'follow'
			});
			if (!res.ok) continue;
			const data = (await res.json()) as Record<string, unknown>;
			const out = { abuse: [] as string[], org: null as string | null };
			for (const e of (data.entities as Record<string, unknown>[]) ?? []) collectAbuse(e, out);
			return {
				ip,
				network: (data.name as string) ?? (data.handle as string) ?? null,
				org: out.org,
				country: (data.country as string) ?? null,
				abuseEmails: [...new Set(out.abuse)].slice(0, 3),
				source: new URL(res.url || base).hostname
			};
		} catch {
			// try the next RDAP endpoint
		}
	}
	return null;
}

function authResult(raw: string | null, mech: string): string | null {
	if (!raw) return null;
	return new RegExp(`\\b${mech}=([a-z]+)`, 'i').exec(raw)?.[1]?.toLowerCase() ?? null;
}

export async function analyzeHeaders(raw: string): Promise<Analysis> {
	const h = parseHeaders(raw);
	const first = (n: string) => h.get(n)?.[0] ?? null;
	const from = addressOf(first('from'));
	const returnPath = addressOf(first('return-path'));
	const replyTo = addressOf(first('reply-to'));
	const fromDomain = domainOf(from);
	const returnPathDomain = domainOf(returnPath);
	const replyToDomain = domainOf(replyTo);
	const authRaw = first('authentication-results') ?? first('arc-authentication-results');
	const auth = {
		spf: authResult(authRaw, 'spf') ?? (first('received-spf')?.split(/\s/)[0]?.toLowerCase() ?? null),
		dkim: authResult(authRaw, 'dkim'),
		dmarc: authResult(authRaw, 'dmarc'),
		raw: authRaw ? authRaw.slice(0, 600) : null
	};
	const dkimDomains = [...new Set((h.get('dkim-signature') ?? []).map((s) => /\bd=([A-Za-z0-9.-]+)/.exec(s)?.[1]?.toLowerCase()).filter(Boolean) as string[])];
	const hops = hopsFrom(h.get('received') ?? []);
	const originIp = hops.length ? hops[hops.length - 1] : null;
	const domainList = [...new Set([fromDomain, returnPathDomain, replyToDomain].filter(Boolean) as string[])].slice(0, 3);
	const [rdap, domains] = await Promise.all([
		originIp ? lookupRdap(originIp.ip) : Promise.resolve(null),
		Promise.all(domainList.map((d) => lookupDomain(d)))
	]);
	const listUnsubscribe = first('list-unsubscribe');
	const oneClickUnsubscribe = /list-unsubscribe=one-click/i.test(first('list-unsubscribe-post') ?? '');

	const flags: Analysis['flags'] = [];
	if (!h.size) flags.push({ level: 'high', text: 'No email headers were found. Paste the full original/raw message headers.' });
	if (auth.dmarc === 'fail') flags.push({ level: 'high', text: 'DMARC failed: the visible From domain did not authenticate. Treat this as likely spoofed.' });
	if (auth.spf && ['fail', 'softfail'].includes(auth.spf)) flags.push({ level: 'medium', text: `SPF result was "${auth.spf}": the sending server was not authorized by the envelope domain.` });
	if (auth.dkim && auth.dkim !== 'pass') flags.push({ level: 'medium', text: `DKIM result was "${auth.dkim}".` });
	if (fromDomain && replyToDomain && orgDomain(fromDomain) !== orgDomain(replyToDomain)) {
		flags.push({ level: 'high', text: `Replies go to a different domain (${replyToDomain}) than the From address (${fromDomain}) — a common phishing trick.` });
	}
	if (fromDomain && returnPathDomain && orgDomain(fromDomain) !== orgDomain(returnPathDomain)) {
		flags.push({ level: 'info', text: `Bounce (Return-Path) domain ${returnPathDomain} differs from From domain ${fromDomain}. This is normal for bulk email services, but it tells you which service actually sent it.` });
	}
	if (fromDomain && dkimDomains.length && !dkimDomains.some((d) => orgDomain(d) === orgDomain(fromDomain))) {
		flags.push({ level: 'info', text: `Signed by ${dkimDomains.join(', ')} rather than ${fromDomain}: that signer is usually the email service provider to report to.` });
	}
	const fromInfo = domains.find((d) => d.domain === fromDomain);
	if (fromInfo && !fromInfo.dmarc) flags.push({ level: 'medium', text: `${fromDomain} publishes no DMARC policy, so anyone can more easily spoof it.` });
	if (fromInfo?.error) flags.push({ level: 'high', text: `${fromDomain} has no DNS records — the From domain may be fake.` });
	if (listUnsubscribe) flags.push({ level: 'info', text: oneClickUnsubscribe ? 'This sender supports one-click unsubscribe (RFC 8058). If it is a real company you once signed up with, unsubscribing is usually safe.' : 'A List-Unsubscribe header is present. Only use it if you recognize the sender; for scams, block and report instead.' });

	return {
		from, fromDomain, returnPath, returnPathDomain, replyTo, replyToDomain,
		subject: first('subject')?.slice(0, 200) ?? null,
		date: first('date'),
		messageId: first('message-id')?.slice(0, 200) ?? null,
		auth, dkimDomains, hops: hops.slice(0, 12), originIp, rdap, domains, listUnsubscribe: listUnsubscribe?.slice(0, 400) ?? null,
		oneClickUnsubscribe, flags
	};
}
