/**
 * Open TCPA class-action settlements. Every entry was read on its official,
 * court-authorized settlement website on Nov 23, 2026. Remove entries after their deadline.
 */
export type Settlement = {
	slug: string;
	caseName: string;
	court: string;
	defendant: string;
	deadline: string; // YYYY-MM-DD claim deadline
	whoQualifies: string;
	payment: string;
	url: string;
	administrator: string;
};

export const SETTLEMENTS_CHECKED = '2026-11-23';

export const SETTLEMENTS: Settlement[] = [
	{
		slug: 'connectamerica',
		caseName: 'Felix v. ConnectAmerica.com, LLC',
		court: 'Court of Common Pleas of Allegheny County, Pennsylvania (No. GD-26-007931)',
		defendant: 'ConnectAmerica.com, LLC',
		deadline: '2026-12-21',
		whoQualifies: 'U.S. individuals who did not give ConnectAmerica their number and got at least one prerecorded message on their cell phone from April 1, 2021 through September 22, 2026.',
		payment: 'The settlement site estimates about $275 per person before fees and costs; payments can be reduced pro rata. Cap is $4,000,000.',
		url: 'https://www.connectamericatcpasettlement.com/',
		administrator: 'Kroll Settlement Administration'
	},
	{
		slug: 'rtr-financial',
		caseName: 'Hecht v. RTR Financial Services Inc.',
		court: 'U.S. District Court, Eastern District of New York (No. 1:25-cv-04924)',
		defendant: 'RTR Financial Services',
		deadline: '2027-01-19',
		whoQualifies: 'People who received a prerecorded or artificial-voice call from RTR Financial Services on a cell phone (see the site for the exact class definition).',
		payment: '$2,925,000 settlement fund; individual amount depends on claims.',
		url: 'https://www.rtrtcpasettlement.com/',
		administrator: 'Kroll Settlement Administration'
	},
	{
		slug: 'american-express',
		caseName: 'Duke v. American Express Company',
		court: 'U.S. District Court, District of Arizona (No. 4:23-cv-00125)',
		defendant: 'American Express',
		deadline: '2027-01-21',
		whoQualifies: 'People who received prerecorded or artificial-voice calls from or for American Express about a credit card account that was not theirs.',
		payment: '$12 million settlement. The site estimates about $100 per approved claim if 50% of class members claim; it could be higher or lower.',
		url: 'https://www.amextelephonesettlement.com/',
		administrator: 'Kroll Settlement Administration'
	},
	{
		slug: 'tradealgo',
		caseName: 'Reyes v. TA Fintech Inc. d/b/a TradeAlgo',
		court: 'Circuit Court, Miami-Dade County, Florida (No. 2026-001915-CA-01)',
		defendant: 'TradeAlgo (TA Fintech Inc.)',
		deadline: '2027-01-25',
		whoQualifies: 'People who got more than one TradeAlgo marketing text in a 12-month period between Feb 24, 2022 and Feb 24, 2026 after replying STOP, or while on the National Do Not Call Registry.',
		payment: 'Up to $50.10 per class member who files a valid claim ($5,250,000 fund).',
		url: 'https://www.tradealgotcpasettlement.com/',
		administrator: 'Kroll Settlement Administration'
	},
	{
		slug: 'buyalerts',
		caseName: 'Reyes v. Live Stream Technology Services, Inc. d/b/a BuyAlerts',
		court: 'Circuit Court, Miami-Dade County, Florida (No. 2026-010685-CA-01)',
		defendant: 'BuyAlerts (Live Stream Technology Services, Inc.)',
		deadline: '2027-02-16',
		whoQualifies: 'People who got more than one BuyAlerts marketing text in a 12-month period between Jan 1, 2022 and Aug 7, 2026 after opting out, or while on the National Do Not Call Registry.',
		payment: 'Up to $42.16 per class member who files a valid claim ($3,600,000 fund).',
		url: 'https://www.buyalertstcpasettlement.com/',
		administrator: 'Kroll Settlement Administration'
	}
];

export function openSettlements(now = new Date()): Settlement[] {
	const today = now.toISOString().slice(0, 10);
	return SETTLEMENTS.filter((s) => s.deadline >= today).sort((a, b) => a.deadline.localeCompare(b.deadline));
}
