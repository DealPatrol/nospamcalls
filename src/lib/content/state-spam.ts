import { US_STATES, STATE_LAWS } from '#lib/content/state-privacy';
import { AREA_CODES, type AreaCode } from '#lib/data/area-codes';

/** Facts on state pages were checked on these official pages on Nov 28, 2026. */
export const STATE_SPAM_CHECKED = '2026-11-28';

export type StateEntry = { abbr: string; name: string; slug: string };

const toSlug = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

export const STATE_ENTRIES: StateEntry[] = US_STATES.map(([abbr, name]) => ({
	abbr,
	name,
	slug: toSlug(name)
}));

export function stateBySlug(slug: string): StateEntry | undefined {
	return STATE_ENTRIES.find((s) => s.slug === slug.toLowerCase());
}

export function stateByAbbr(abbr: string): StateEntry | undefined {
	return STATE_ENTRIES.find((s) => s.abbr === abbr.toUpperCase());
}

export function stateAreaCodes(abbr: string): AreaCode[] {
	return AREA_CODES.filter((c) => c.kind === 'geographic' && c.state === abbr).sort((a, b) =>
		a.npa.localeCompare(b.npa)
	);
}

export function statePrivacyLaw(abbr: string) {
	return STATE_LAWS[abbr] ?? null;
}

export function stateSpamPath(entry: StateEntry): string {
	return `/spam-calls/${entry.slug}`;
}

export type StateResource = { label: string; href: string; note: string };

/**
 * Hand-checked state resources. Only states listed here get a state-specific section; every other state page
 * shows the federal steps only, so nothing is guessed. Sources opened Nov 28, 2026:
 * - https://www.alabamaag.gov/consumer-complaint/ (form; Consumer Hotline 1-800-392-5658 or 334-242-7335)
 * - https://www.alabamaag.gov/licensing-registration/alabama-telemarketing-act/ (licensing, Ala. Code § 8-19A-1)
 * - https://psc.alabama.gov/register-for-do-not-call/ (state register merged with the national registry)
 */
export const STATE_RESOURCES: Record<string, { intro: string; resources: StateResource[] }> = {
	AL: {
		intro:
			'Alabama has adopted the National Do Not Call Registry and merged its own register with the FTC’s national list, according to the Alabama Public Service Commission. If you enrolled on Alabama’s register before August 14, 2003, you do not need to register again. The Alabama Telemarketing Act (Code of Alabama § 8-19A-1 and following) requires anyone who makes commercial telephone solicitations to be licensed by the Attorney General’s Office.',
		resources: [
			{
				label: 'Alabama Attorney General consumer complaint form',
				href: 'https://www.alabamaag.gov/consumer-complaint/',
				note: 'File a complaint about a telemarketer or scam caller. Consumer Hotline: 1-800-392-5658 or 334-242-7335.'
			},
			{
				label: 'Alabama Telemarketing Act (Attorney General)',
				href: 'https://www.alabamaag.gov/licensing-registration/alabama-telemarketing-act/',
				note: 'Commercial telephone solicitors must be licensed by the Attorney General’s Office.'
			},
			{
				label: 'Alabama PSC: Register for Do Not Call',
				href: 'https://psc.alabama.gov/register-for-do-not-call/',
				note: 'Alabama uses the national registry. Register at donotcall.gov or call 1-888-382-1222 (TTY 1-866-290-4236).'
			}
		]
	}
};
