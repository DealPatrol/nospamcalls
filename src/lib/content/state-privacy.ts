/**
 * U.S. state comprehensive consumer privacy laws in effect, with statute citations and effective dates as listed in
 * Foley & Lardner's "U.S. State Comprehensive Consumer Data Privacy Law Comparison" (V16, January 2026) and the IAPP
 * (19 enacted comprehensive laws; Indiana, Kentucky and Rhode Island took effect January 1, 2026). Checked Nov 23, 2026.
 * Florida's law is excluded because it applies only to very large companies (about $1B+ in revenue).
 */
export const STATE_LAWS_CHECKED = '2026-11-23';

export type StateLaw = { name: string; abbr: string; cite: string; effective: string };

export const STATE_LAWS: Record<string, StateLaw> = {
	CA: { name: 'California Consumer Privacy Act, as amended by the California Privacy Rights Act', abbr: 'CCPA/CPRA', cite: 'Cal. Civ. Code § 1798.100 et seq.', effective: 'January 1, 2023 (CPRA amendments)' },
	CO: { name: 'Colorado Privacy Act', abbr: 'CPA', cite: 'Colo. Rev. Stat. § 6-1-1301 et seq.', effective: 'July 1, 2023' },
	CT: { name: 'Connecticut Data Privacy Act', abbr: 'CTDPA', cite: 'Conn. Gen. Stat. § 42-515 et seq.', effective: 'July 1, 2023' },
	DE: { name: 'Delaware Personal Data Privacy Act', abbr: 'DPDPA', cite: '6 Del. C. § 12D-101 et seq.', effective: 'January 1, 2025' },
	IN: { name: 'Indiana Consumer Data Protection Act', abbr: 'Ind. CDPA', cite: 'Ind. Code § 24-15', effective: 'January 1, 2026' },
	IA: { name: 'Iowa Consumer Data Protection Act', abbr: 'Iowa CDPA', cite: 'Iowa Code ch. 715D', effective: 'January 1, 2025' },
	KY: { name: 'Kentucky Consumer Data Protection Act', abbr: 'KCDPA', cite: 'Ky. Rev. Stat. § 367.3611 et seq.', effective: 'January 1, 2026' },
	MD: { name: 'Maryland Online Data Privacy Act', abbr: 'MODPA', cite: 'Md. Code, Com. Law § 14-4701 et seq.', effective: 'October 1, 2025' },
	MN: { name: 'Minnesota Consumer Data Privacy Act', abbr: 'MNCDPA', cite: 'Minn. Stat. ch. 325M', effective: 'July 31, 2025' },
	MT: { name: 'Montana Consumer Data Privacy Act', abbr: 'MCDPA', cite: 'Mont. Code Ann. § 30-14-2801 et seq.', effective: 'October 1, 2024' },
	NE: { name: 'Nebraska Data Privacy Act', abbr: 'NDPA', cite: 'Neb. Rev. Stat. § 87-1101 et seq.', effective: 'January 1, 2025' },
	NH: { name: 'New Hampshire Privacy Act', abbr: 'NHPA', cite: 'N.H. Rev. Stat. Ann. ch. 507-H', effective: 'January 1, 2025' },
	NJ: { name: 'New Jersey Data Privacy Act', abbr: 'NJDPA', cite: 'N.J. Stat. § 56:8-166.4 et seq.', effective: 'January 15, 2025' },
	OR: { name: 'Oregon Consumer Privacy Act', abbr: 'OCPA', cite: 'Or. Rev. Stat. § 646A.570 et seq.', effective: 'July 1, 2024' },
	RI: { name: 'Rhode Island Data Transparency and Privacy Protection Act', abbr: 'RIDTPPA', cite: 'R.I. Gen. Laws tit. 6', effective: 'January 1, 2026' },
	TN: { name: 'Tennessee Information Protection Act', abbr: 'TIPA', cite: 'Tenn. Code Ann. § 47-18-3301 et seq.', effective: 'July 1, 2025' },
	TX: { name: 'Texas Data Privacy and Security Act', abbr: 'TDPSA', cite: 'Tex. Bus. & Com. Code § 541.001 et seq.', effective: 'July 1, 2024' },
	UT: { name: 'Utah Consumer Privacy Act', abbr: 'UCPA', cite: 'Utah Code Ann. § 13-61-101 et seq.', effective: 'December 31, 2023' },
	VA: { name: 'Virginia Consumer Data Protection Act', abbr: 'VCDPA', cite: 'Va. Code § 59.1-575 et seq.', effective: 'January 1, 2023' }
};

export const US_STATES: [string, string][] = [
	['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'],
	['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'],
	['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
	['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
	['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'],
	['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
	['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
	['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
	['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']
];

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const title = (s: string) => s.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('-');

/**
 * "Search yourself" links on people-search sites. URL patterns were opened live on Nov 23, 2026
 * (Spokeo, USPhoneBook, PeopleFinders and FastBackgroundCheck returned name/state result pages; TruePeopleSearch and
 * FastPeopleSearch patterns are documented and load behind a human check; Whitepages accepts nationwide name pages).
 * Links open the broker's own site in your browser; NoSpamCalls never sees your name.
 */
export function brokerSearchLinks(first: string, last: string, state: string, stateName: string, city: string) {
	const f = first.trim();
	const l = last.trim();
	const full = `${f} ${l}`;
	const st = state.toLowerCase();
	const c = city.trim();
	return [
		{ slug: 'spokeo', name: 'Spokeo', url: `https://www.spokeo.com/${title(f)}-${title(l)}/${stateName.replace(/\s+/g, '-')}${c ? `/${title(c)}` : ''}` },
		{ slug: 'truepeoplesearch', name: 'TruePeopleSearch', url: `https://www.truepeoplesearch.com/results?${new URLSearchParams({ name: full, citystatezip: c ? `${c}, ${state}` : state })}` },
		{ slug: 'fastpeoplesearch', name: 'FastPeopleSearch', url: `https://www.fastpeoplesearch.com/name/${slug(f)}-${slug(l)}_${c ? `${slug(c)}-` : ''}${st}` },
		{ slug: 'usphonebook', name: 'USPhoneBook', url: `https://www.usphonebook.com/${slug(f)}-${slug(l)}/${st}${c ? `/${slug(c)}` : ''}` },
		{ slug: 'peoplefinders', name: 'PeopleFinders', url: `https://www.peoplefinders.com/name/${slug(f)}-${slug(l)}/${st}${c ? `/${slug(c)}` : ''}` },
		{ slug: 'fastbackgroundcheck', name: 'FastBackgroundCheck', url: `https://www.fastbackgroundcheck.com/people/${slug(f)}-${slug(l)}/${c ? `${slug(c)}-` : ''}${st}` },
		{ slug: 'whitepages', name: 'Whitepages', url: `https://www.whitepages.com/name/${title(f)}-${title(l)}` },
		{ slug: 'google', name: 'Google (your name + state)', url: `https://www.google.com/search?${new URLSearchParams({ q: `"${full}" ${c ? `${c} ` : ''}${stateName}` })}` }
	];
}
