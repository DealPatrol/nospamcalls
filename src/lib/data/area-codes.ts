import raw from './area-codes.json';

export type AreaCode = {
	npa: string;
	kind: 'geographic' | 'toll-free';
	state: string;
	stateName: string;
	timeZoneCode: string;
	timeZone: string;
	timeZoneNote: string;
	inServiceDate: string;
	overlay: boolean;
	overlays: string[];
	parent: string;
	dialing: string;
	dialingNotes: string;
	areaServed: string;
};

type Dataset = {
	source: string;
	sourceUrl: string;
	fileDate: string;
	codes: AreaCode[];
};

const data = raw as Dataset;

export const AREA_CODE_SOURCE = {
	name: data.source,
	url: data.sourceUrl,
	fileDate: data.fileDate
};

export const AREA_CODES: AreaCode[] = data.codes;

const byNpa = new Map(AREA_CODES.map((c) => [c.npa, c]));

export function getAreaCode(npa: string): AreaCode | undefined {
	return byNpa.get(npa);
}

export function areaCodesByState(): { state: string; stateName: string; codes: AreaCode[] }[] {
	const map = new Map<string, AreaCode[]>();
	for (const code of AREA_CODES) {
		if (code.kind !== 'geographic') continue;
		const list = map.get(code.state) ?? [];
		list.push(code);
		map.set(code.state, list);
	}
	return [...map.entries()]
		.map(([state, codes]) => ({
			state,
			stateName: codes[0].stateName,
			codes
		}))
		.sort((a, b) => a.stateName.localeCompare(b.stateName));
}

export const TOLL_FREE_CODES = AREA_CODES.filter((c) => c.kind === 'toll-free');
