import type { RequestHandler } from '@sveltejs/kit';
import { sqlClient } from '#lib/server/db';

const esc = (v: unknown) => {
	const s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
	return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const GET: RequestHandler = async () => {
	const rows = (await sqlClient()`
		SELECT e164, total_gov_count, fcc_count, ftc_count, top_subject, top_method, first_reported_at, last_reported_at
		FROM gov_spam_numbers ORDER BY total_gov_count DESC, last_reported_at DESC NULLS LAST LIMIT 500`) as Record<string, unknown>[];
	const header = 'number,total_federal_complaints,fcc_complaints,ftc_complaints,latest_topic,call_type,first_complaint,latest_complaint,nospamcalls_url';
	const lines = rows.map((r) =>
		[r.e164, r.total_gov_count, r.fcc_count, r.ftc_count, r.top_subject, r.top_method, r.first_reported_at, r.last_reported_at, `https://nospamcalls.org/number/${String(r.e164).replace('+', '')}`]
			.map(esc)
			.join(',')
	);
	return new Response([header, ...lines].join('\n') + '\n', {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="nospamcalls-top-500-spam-numbers.csv"',
			'Cache-Control': 'public, max-age=0, s-maxage=3600',
			'X-Robots-Tag': 'noindex'
		}
	});
};
