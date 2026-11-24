import { error } from "@sveltejs/kit";
import { getReportsByAreaCode } from "#lib/db";
import { getAreaCode } from "#lib/data/area-codes";
import { govNumbersByAreaCode } from "#lib/server/gov";
import type { PageServerLoad } from "./$types";

export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
	const code = getAreaCode(params.code);
	if (!code) error(404, "Area code not found");

	let reports = { total: 0, recent: [] as Awaited<ReturnType<typeof getReportsByAreaCode>>["recent"] };
	try {
		reports = await getReportsByAreaCode(code.npa);
	} catch (err) {
		console.error("area-code report query failed", err);
	}

	let gov: Awaited<ReturnType<typeof govNumbersByAreaCode>> = { numbers: [], total: 0, complaints: 0 };
	try {
		gov = await govNumbersByAreaCode(code.npa, 10);
	} catch (err) {
		console.error("area-code gov query failed", err);
	}

	return { code, reports, gov };
};
