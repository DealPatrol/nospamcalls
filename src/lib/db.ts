import { neon } from '@neondatabase/serverless';
import type { CategoryId } from './categories';
 import { REPORTS_PER_HOUR, WAITLIST_PER_HOUR } from './limits';
import { hourWindow } from './security';

function client() {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error('DATABASE_URL is not set');
	return neon(url);
}

export type ReportRow = {
	id: number;
	number_e164: string;
	category: CategoryId;
	comment: string | null;
	created_at: string;
};

export type NumberSummary = {
	total: number;
	byCategory: Record<string, number>;
	recent: ReportRow[];
};

export async function getNumberSummary(e164: string): Promise<NumberSummary> {
	const sql = client();
	const [counts, recent] = await Promise.all([
		sql`SELECT category, count(*)::int AS count FROM reports WHERE number_e164 = ${e164} GROUP BY category`,
		sql`SELECT id, number_e164, category, comment, created_at
			FROM reports
			WHERE number_e164 = ${e164}
			ORDER BY created_at DESC
			LIMIT 50`
	]);

	const byCategory: Record<string, number> = {};
	let total = 0;
	for (const row of counts as { category: string; count: number }[]) {
		byCategory[row.category] = row.count;
		total += row.count;
	}

	return {
		total,
		byCategory,
		recent: recent as ReportRow[]
	};
}

export async function insertReport(input: {
	e164: string;
	category: CategoryId;
	comment: string | null;
	ipHash: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
	const sql = client();
	const windowStart = hourWindow();
	const limited = await sql`
		INSERT INTO rate_limits (ip_hash, action, window_start, count)
		VALUES (${input.ipHash}, 'report', ${windowStart.toISOString()}, 1)
		ON CONFLICT (ip_hash, action, window_start)
		DO UPDATE SET count = rate_limits.count + 1
		RETURNING count
	`;
	const count = Number((limited[0] as { count: number }).count);
	if (count > REPORTS_PER_HOUR) {
		return { ok: false, error: 'Too many reports from this network. Please try again later.' };
	}

	await sql`
		INSERT INTO reports (number_e164, category, comment, ip_hash)
		VALUES (${input.e164}, ${input.category}, ${input.comment}, ${input.ipHash})
	`;
	return { ok: true };
}

export async function insertWaitlist(input: {
	email: string;
	type: 'app' | 'business';
	ipHash: string;
}): Promise<{ ok: true; already: boolean } | { ok: false; error: string }> {
	const sql = client();
	const windowStart = hourWindow();
	const limited = await sql`
		INSERT INTO rate_limits (ip_hash, action, window_start, count)
		VALUES (${input.ipHash}, ${'waitlist:' + input.type}, ${windowStart.toISOString()}, 1)
		ON CONFLICT (ip_hash, action, window_start)
		DO UPDATE SET count = rate_limits.count + 1
		RETURNING count
	`;
	const count = Number((limited[0] as { count: number }).count);
	if (count > WAITLIST_PER_HOUR) {
		return { ok: false, error: 'Too many sign-ups from this network. Please try again later.' };
	}

	const result = await sql`
		INSERT INTO waitlist (email, type)
		VALUES (${input.email}, ${input.type})
		ON CONFLICT (email, type) DO NOTHING
		RETURNING id
	`;
	return { ok: true, already: result.length === 0 };
}

export async function recentReportedSlugs(limit = 200): Promise<string[]> {
	const sql = client();
	const rows = await sql`
		SELECT number_e164
		FROM reports
		GROUP BY number_e164
		ORDER BY max(created_at) DESC
		LIMIT ${limit}
	`;
	return (rows as { number_e164: string }[]).map((r) => r.number_e164);
}
