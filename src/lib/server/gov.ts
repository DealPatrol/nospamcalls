import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ensureSchema, sqlClient } from './db';

export type GovNumber = {
	e164: string;
	ftc_count: number;
	fcc_count: number;
	total_gov_count: number;
	top_subject: string | null;
	top_method: string | null;
	sample_city: string | null;
	sample_state: string | null;
	first_reported_at: string | null;
	last_reported_at: string | null;
};

type Complaint = {
	source: 'ftc' | 'fcc';
	id: string;
	e164: string;
	subject: string | null;
	method: string | null;
	city: string | null;
	state: string | null;
	at: string;
};

const RAW_PHONE_RE = /^[\d\s().+-]{10,18}$/;

/** Strict validation: real U.S. NANP number, no scrambled strings, no 555 fictional numbers. */
export function validUsNumber(raw: unknown): string | null {
	if (typeof raw !== 'string') return null;
	const value = raw.trim();
	if (!value || !RAW_PHONE_RE.test(value)) return null;
	const digits = value.replace(/\D/g, '');
	if (digits.length !== 10 && !(digits.length === 11 && digits.startsWith('1'))) return null;
	const parsed = parsePhoneNumberFromString(digits.length === 10 ? digits : `+${digits}`, 'US');
	if (!parsed || !parsed.isValid() || parsed.country !== 'US') return null;
	const e164 = parsed.number;
	if (!/^\+1\d{10}$/.test(e164)) return null;
	const national = e164.slice(2);
	if (national.slice(3, 6) === '555') return null;
	if (/^(\d)\1{9}$/.test(national)) return null;
	return e164;
}

function cleanText(value: unknown, max = 120): string | null {
	if (typeof value !== 'string') return null;
	const text = value.replace(/\s+/g, ' ').trim();
	if (!text || text.length > max * 2) return null;
	return text.slice(0, max);
}

function validDate(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const v = value.trim();
	if (!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?/.test(v)) return null;
	const d = new Date(v.includes('T') ? v : `${v.replace(' ', 'T')}Z`);
	if (Number.isNaN(d.getTime())) return null;
	if (d.getTime() > Date.now() + 2 * 86400000 || d.getUTCFullYear() < 2000) return null;
	return d.toISOString();
}

const US_STATES = new Set(
	'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR GU VI AS MP'.split(
		' '
	)
);
const STATE_NAMES: Record<string, string> = {
	alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO',
	connecticut: 'CT', delaware: 'DE', 'district of columbia': 'DC', florida: 'FL', georgia: 'GA',
	hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY',
	louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN',
	mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH',
	'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
	ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
	'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
	virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
	'puerto rico': 'PR'
};

function cleanState(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const v = value.trim();
	if (US_STATES.has(v.toUpperCase()) && v.length === 2) return v.toUpperCase();
	return STATE_NAMES[v.toLowerCase()] ?? null;
}

async function fetchJson(url: string, timeoutMs = 20000): Promise<unknown> {
	const res = await fetch(url, {
		headers: { accept: 'application/json', 'user-agent': 'NoSpamCalls/1.0 (+https://nospamcalls.org)' },
		signal: AbortSignal.timeout(timeoutMs)
	});
	if (!res.ok) throw new Error(`${url.split('?')[0]} returned ${res.status}`);
	return res.json();
}

/** FCC Consumer Complaints Data (Socrata dataset 3xyp-aqkj), issue = "Unwanted Calls". */
export async function fetchFccComplaints(sinceIso: string, limit = 5000): Promise<Complaint[]> {
	const where = `issue='Unwanted Calls' AND ticket_created > '${sinceIso.slice(0, 19)}'`;
	const url =
		'https://opendata.fcc.gov/resource/3xyp-aqkj.json?' +
		new URLSearchParams({
			$select:
				'id,ticket_created,issue_date,caller_id_number,advertiser_business_phone_number,type_of_call_or_messge,type_of_property_goods_or_services,city,state',
			$where: where,
			$order: 'ticket_created DESC',
			$limit: String(limit)
		}).toString();
	const rows = (await fetchJson(url, 30000)) as Record<string, unknown>[];
	const out: Complaint[] = [];
	for (const row of Array.isArray(rows) ? rows : []) {
		const id = typeof row.id === 'string' ? row.id : null;
		const at = validDate(row.ticket_created) ?? validDate(row.issue_date);
		if (!id || !at) continue;
		const numbers = new Set<string>();
		for (const raw of [row.caller_id_number, row.advertiser_business_phone_number]) {
			const e164 = validUsNumber(raw);
			if (e164) numbers.add(e164);
		}
		for (const e164 of numbers) {
			out.push({
				source: 'fcc',
				id: `${id}:${e164}`,
				e164,
				subject: cleanText(row.type_of_property_goods_or_services),
				method: cleanText(row.type_of_call_or_messge, 60),
				city: cleanText(row.city, 60),
				state: cleanState(row.state),
				at
			});
		}
	}
	return out;
}

/** FTC Do Not Call Reported Calls Data API (api.ftc.gov/v0/dnc-complaints). */
export async function fetchFtcComplaints(sinceIso: string, maxPages = 4): Promise<Complaint[]> {
	const key = process.env.FTC_API_KEY || 'DEMO_KEY';
	const since = sinceIso.slice(0, 10);
	const out: Complaint[] = [];
	for (let page = 0; page < maxPages; page++) {
		const url =
			'https://api.ftc.gov/v0/dnc-complaints?' +
			new URLSearchParams({
				api_key: key,
				items_per_page: '50',
				offset: String(page * 50),
				created_date_from: `"${since} 00:00:00"`,
				sort_by: 'created_date',
				sort_order: 'DESC'
			}).toString();
		let body: { data?: { id?: string; attributes?: Record<string, unknown> }[] };
		try {
			body = (await fetchJson(url)) as typeof body;
		} catch (err) {
			if (page === 0) throw err;
			break;
		}
		const data = Array.isArray(body.data) ? body.data : [];
		for (const item of data) {
			const a = item.attributes ?? {};
			const id = typeof item.id === 'string' && /^[a-f0-9]{16,64}$/.test(item.id) ? item.id : null;
			const e164 = validUsNumber(a['company-phone-number']);
			const at = validDate(a['created-date']) ?? validDate(a['violation-date']);
			if (!id || !e164 || !at) continue;
			const robo = a['recorded-message-or-robocall'];
			out.push({
				source: 'ftc',
				id,
				e164,
				subject: cleanText(a.subject),
				method: robo === 'Y' ? 'Robocall / recorded message' : robo === 'N' ? 'Live caller' : null,
				city: cleanText(a['consumer-city'], 60),
				state: cleanState(a['consumer-state']),
				at
			});
		}
		if (data.length < 50) break;
	}
	return out;
}

type Agg = {
	e164: string;
	ftc: number;
	fcc: number;
	subject: string | null;
	method: string | null;
	city: string | null;
	state: string | null;
	first: string;
	last: string;
	lastAt: number;
};

/** Inserts complaints we have not seen before and folds them into gov_spam_numbers. */
export async function upsertComplaints(complaints: Complaint[]): Promise<{ newComplaints: number; numbers: number }> {
	if (!complaints.length) return { newComplaints: 0, numbers: 0 };
	await ensureSchema();
	const sql = sqlClient();
	let fresh: Complaint[] = [];
	for (let i = 0; i < complaints.length; i += 1000) {
		const chunk = complaints.slice(i, i + 1000);
		const inserted = (await sql`
			INSERT INTO gov_complaint_ids (source, complaint_id, e164)
			SELECT * FROM unnest(${chunk.map((c) => c.source)}::text[], ${chunk.map((c) => c.id)}::text[], ${chunk.map((c) => c.e164)}::text[])
			ON CONFLICT DO NOTHING
			RETURNING source, complaint_id`) as { source: string; complaint_id: string }[];
		const keys = new Set(inserted.map((r) => `${r.source}|${r.complaint_id}`));
		fresh = fresh.concat(chunk.filter((c) => keys.has(`${c.source}|${c.id}`)));
	}
	const byNumber = new Map<string, Agg>();
	for (const c of fresh) {
		const t = new Date(c.at).getTime();
		const agg = byNumber.get(c.e164) ?? {
			e164: c.e164, ftc: 0, fcc: 0, subject: null, method: null, city: null, state: null,
			first: c.at, last: c.at, lastAt: 0
		};
		if (c.source === 'ftc') agg.ftc++;
		else agg.fcc++;
		if (t >= agg.lastAt) {
			agg.lastAt = t;
			agg.last = c.at;
			agg.subject = c.subject ?? agg.subject;
			agg.method = c.method ?? agg.method;
			agg.city = c.city ?? agg.city;
			agg.state = c.state ?? agg.state;
		}
		if (t < new Date(agg.first).getTime()) agg.first = c.at;
		byNumber.set(c.e164, agg);
	}
	const aggs = [...byNumber.values()];
	for (let i = 0; i < aggs.length; i += 500) {
		const chunk = aggs.slice(i, i + 500);
		await sql`
			INSERT INTO gov_spam_numbers AS g (e164, ftc_count, fcc_count, total_gov_count, top_subject, top_method, sample_city, sample_state, first_reported_at, last_reported_at, updated_at)
			SELECT e164, ftc, fcc, ftc + fcc, subject, method, city, state, first_at, last_at, NOW()
			FROM unnest(
				${chunk.map((a) => a.e164)}::text[], ${chunk.map((a) => a.ftc)}::int[], ${chunk.map((a) => a.fcc)}::int[],
				${chunk.map((a) => a.subject)}::text[], ${chunk.map((a) => a.method)}::text[], ${chunk.map((a) => a.city)}::text[],
				${chunk.map((a) => a.state)}::text[], ${chunk.map((a) => a.first)}::timestamptz[], ${chunk.map((a) => a.last)}::timestamptz[]
			) AS t(e164, ftc, fcc, subject, method, city, state, first_at, last_at)
			ON CONFLICT (e164) DO UPDATE SET
				ftc_count = g.ftc_count + EXCLUDED.ftc_count,
				fcc_count = g.fcc_count + EXCLUDED.fcc_count,
				total_gov_count = g.total_gov_count + EXCLUDED.total_gov_count,
				top_subject = CASE WHEN EXCLUDED.last_reported_at >= g.last_reported_at THEN COALESCE(EXCLUDED.top_subject, g.top_subject) ELSE COALESCE(g.top_subject, EXCLUDED.top_subject) END,
				top_method = CASE WHEN EXCLUDED.last_reported_at >= g.last_reported_at THEN COALESCE(EXCLUDED.top_method, g.top_method) ELSE COALESCE(g.top_method, EXCLUDED.top_method) END,
				sample_city = COALESCE(EXCLUDED.sample_city, g.sample_city),
				sample_state = COALESCE(EXCLUDED.sample_state, g.sample_state),
				first_reported_at = LEAST(g.first_reported_at, EXCLUDED.first_reported_at),
				last_reported_at = GREATEST(g.last_reported_at, EXCLUDED.last_reported_at),
				updated_at = NOW()`;
	}
	return { newComplaints: fresh.length, numbers: aggs.length };
}

export async function ingestGovComplaints(opts: { days?: number; fccLimit?: number; ftcPages?: number } = {}) {
	const since = new Date(Date.now() - (opts.days ?? 3) * 86400000).toISOString();
	const result = {
		fcc: { fetched: 0, error: null as string | null },
		ftc: { fetched: 0, error: null as string | null },
		newComplaints: 0,
		numbersTouched: 0,
		totalNumbers: 0
	};
	const all: Complaint[] = [];
	try {
		const rows = await fetchFccComplaints(since, opts.fccLimit ?? 5000);
		result.fcc.fetched = rows.length;
		all.push(...rows);
	} catch (err) {
		result.fcc.error = String((err as Error).message ?? err);
	}
	try {
		const rows = await fetchFtcComplaints(since, opts.ftcPages ?? 4);
		result.ftc.fetched = rows.length;
		all.push(...rows);
	} catch (err) {
		result.ftc.error = String((err as Error).message ?? err);
	}
	const saved = await upsertComplaints(all);
	result.newComplaints = saved.newComplaints;
	result.numbersTouched = saved.numbers;
	const count = await sqlClient()`SELECT count(*)::int AS n FROM gov_spam_numbers`;
	result.totalNumbers = Number((count[0] as { n: number }).n);
	return result;
}

function normalizeRow(row: Record<string, unknown>): GovNumber {
	const iso = (v: unknown) => (v ? new Date(String(v)).toISOString() : null);
	return {
		e164: String(row.e164),
		ftc_count: Number(row.ftc_count),
		fcc_count: Number(row.fcc_count),
		total_gov_count: Number(row.total_gov_count),
		top_subject: (row.top_subject as string) ?? null,
		top_method: (row.top_method as string) ?? null,
		sample_city: (row.sample_city as string) ?? null,
		sample_state: (row.sample_state as string) ?? null,
		first_reported_at: iso(row.first_reported_at),
		last_reported_at: iso(row.last_reported_at)
	};
}

export async function getGovNumber(e164: string): Promise<GovNumber | null> {
	await ensureSchema();
	const rows = await sqlClient()`SELECT * FROM gov_spam_numbers WHERE e164 = ${e164}`;
	return rows.length ? normalizeRow(rows[0] as Record<string, unknown>) : null;
}

/** Most-complained-about numbers in the last N days (ties broken by recency). */
export async function topGovNumbers(limit = 100, days = 30, minCount = 1): Promise<GovNumber[]> {
	await ensureSchema();
	const since = new Date(Date.now() - days * 86400000).toISOString();
	const rows = await sqlClient()`
		SELECT * FROM gov_spam_numbers
		WHERE last_reported_at >= ${since} AND total_gov_count >= ${minCount}
		ORDER BY total_gov_count DESC, last_reported_at DESC
		LIMIT ${limit}`;
	return (rows as Record<string, unknown>[]).map(normalizeRow);
}

export async function recentGovNumbers(limit = 8): Promise<GovNumber[]> {
	await ensureSchema();
	const rows = await sqlClient()`SELECT * FROM gov_spam_numbers ORDER BY last_reported_at DESC NULLS LAST LIMIT ${limit}`;
	return (rows as Record<string, unknown>[]).map(normalizeRow);
}

export async function sitemapGovNumbers(limit = 500): Promise<string[]> {
	await ensureSchema();
	const rows = await sqlClient()`
		SELECT e164 FROM gov_spam_numbers WHERE total_gov_count >= 2
		ORDER BY total_gov_count DESC, last_reported_at DESC LIMIT ${limit}`;
	return (rows as { e164: string }[]).map((r) => r.e164);
}

export async function govStats(): Promise<{ numbers: number; complaints: number; lastIngest: string | null }> {
	await ensureSchema();
	const rows = await sqlClient()`
		SELECT (SELECT count(*)::int FROM gov_spam_numbers) AS numbers,
		       (SELECT count(*)::int FROM gov_complaint_ids) AS complaints,
		       (SELECT max(updated_at) FROM gov_spam_numbers) AS last_ingest`;
	const r = rows[0] as { numbers: number; complaints: number; last_ingest: unknown };
	return {
		numbers: Number(r.numbers),
		complaints: Number(r.complaints),
		lastIngest: r.last_ingest ? new Date(String(r.last_ingest)).toISOString() : null
	};
}
