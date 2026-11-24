import { json, type RequestHandler } from '@sveltejs/kit';
import { allowAction } from '#lib/server/db';
import { isIP } from 'node:net';
import { analyzeHeaders, isPublicIp, lookupDomain, lookupRdap } from '#lib/server/email-analyze';
import { hashIp } from '#lib/security';

export const config = { maxDuration: 20 };

const DOMAIN_RE = /^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

// Headers are analyzed in memory only and are never written to the database or logs.
export const POST: RequestHandler = async (event) => {
	const body = (await event.request.json().catch(() => ({}))) as Record<string, unknown>;
	try {
		if (!(await allowAction(hashIp(event.getClientAddress()), 'email_analyze', 40))) {
			return json({ error: 'Too many checks from this network. Try again in an hour.' }, { status: 429 });
		}
	} catch {
		// If the rate-limit table is unavailable, still allow the stateless analysis.
	}
	if (typeof body.headers === 'string' && body.headers.trim()) {
		const raw = body.headers.slice(0, 100_000);
		return json({ mode: 'headers', analysis: await analyzeHeaders(raw) }, { headers: { 'cache-control': 'no-store' } });
	}
	if (typeof body.domain === 'string' && body.domain.trim()) {
		let domain = body.domain.trim().toLowerCase();
		if (domain.includes('@')) domain = domain.split('@').pop() ?? '';
		domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
		if (!DOMAIN_RE.test(domain)) return json({ error: 'Enter a domain like example.com or an email address.' }, { status: 400 });
		const info = await lookupDomain(domain);
		return json({ mode: 'domain', domain: info }, { headers: { 'cache-control': 'no-store' } });
	}
	if (typeof body.ip === 'string' && isIP(body.ip.trim()) && isPublicIp(body.ip.trim())) {
		return json({ mode: 'ip', rdap: await lookupRdap(body.ip.trim()) });
	}
	return json({ error: 'Paste raw email headers or enter a sender domain.' }, { status: 400 });
};
