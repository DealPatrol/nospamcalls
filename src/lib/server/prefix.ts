import { ensureSchema, sqlClient } from './db';
import { AREA_CODES } from '#lib/data/area-codes';

export type PrefixNumber = { e164: string; total_gov_count: number; top_subject: string | null; last_reported_at: string | null };
export type PrefixResult = {
	npa: string;
	nxx: string | null;
	inService: boolean;
	prefixNumbers: PrefixNumber[];
	prefixTotal: number;
	areaNumbers: PrefixNumber[];
	areaTotal: number;
	areaComplaints: number;
};

export function validNpa(v: unknown): string | null {
	const s = String(v ?? '').replace(/\D/g, '');
	return /^[2-9]\d{2}$/.test(s) ? s : null;
}
export function validNxx(v: unknown): string | null {
	const s = String(v ?? '').replace(/\D/g, '');
	return /^[2-9]\d{2}$/.test(s) ? s : null;
}

const iso = (v: unknown) => (v ? new Date(String(v)).toISOString() : null);
const row = (r: Record<string, unknown>): PrefixNumber => ({
	e164: String(r.e164),
	total_gov_count: Number(r.total_gov_count),
	top_subject: (r.top_subject as string) ?? null,
	last_reported_at: iso(r.last_reported_at)
});

/** Real FTC/FCC-reported numbers sharing an area code (NPA) and, if given, the same 3-digit prefix (NXX). */
export async function prefixSpam(npa: string, nxx: string | null, limit = 200): Promise<PrefixResult> {
	await ensureSchema();
	const sql = sqlClient();
	const areaLike = `+1${npa}%`;
	const prefixLike = nxx ? `+1${npa}${nxx}%` : null;
	const [prefixRows, prefixAgg, areaRows, areaAgg] = await Promise.all([
		prefixLike
			? sql`SELECT e164, total_gov_count, top_subject, last_reported_at FROM gov_spam_numbers WHERE e164 LIKE ${prefixLike}
				ORDER BY total_gov_count DESC, last_reported_at DESC NULLS LAST LIMIT ${limit}`
			: Promise.resolve([]),
		prefixLike ? sql`SELECT count(*)::int AS n FROM gov_spam_numbers WHERE e164 LIKE ${prefixLike}` : Promise.resolve([{ n: 0 }]),
		sql`SELECT e164, total_gov_count, top_subject, last_reported_at FROM gov_spam_numbers WHERE e164 LIKE ${areaLike}
			ORDER BY total_gov_count DESC, last_reported_at DESC NULLS LAST LIMIT ${limit}`,
		sql`SELECT count(*)::int AS n, coalesce(sum(total_gov_count),0)::int AS c FROM gov_spam_numbers WHERE e164 LIKE ${areaLike}`
	]);
	const a = (areaAgg as { n: number; c: number }[])[0];
	return {
		npa,
		nxx,
		inService: AREA_CODES.some((c) => c.npa === npa),
		prefixNumbers: (prefixRows as Record<string, unknown>[]).map(row),
		prefixTotal: Number((prefixAgg as { n: number }[])[0]?.n ?? 0),
		areaNumbers: (areaRows as Record<string, unknown>[]).map(row),
		areaTotal: Number(a?.n ?? 0),
		areaComplaints: Number(a?.c ?? 0)
	};
}
