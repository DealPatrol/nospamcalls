/**
 * Paid-app features NoSpamCalls rebuilt as free web tools. Prices and paywall facts were read on each vendor's own
 * pricing page, help center, or App Store listing on PAID_CHECKED. Prices change; always confirm on the vendor's site.
 */
export const PAID_CHECKED = 'November 23, 2026';

export type PaidFeature = {
	href: string;
	label: string;
	free: string;
	paid: string;
	sources: { name: string; url: string }[];
};

export const PAID_FEATURES: PaidFeature[] = [
	{
		href: '/text-scam-check',
		label: 'Scam text & link checker',
		free: 'Paste any text: we check every link’s real domain age (RDAP), look-alike and brand-impersonation domains, link shorteners, scam phrases, and any phone number against FTC/FCC complaints.',
		paid: 'Spam-text filtering is a paid feature in RoboKiller (subscription after a 7-day trial), Truecaller (SMS fraud detection), and Aura (spam-text protection, iOS, on the $32/mo Family plan or as an add-on).',
		sources: [
			{ name: 'RoboKiller help center', url: 'https://support.robokiller.com/hc/en-us/articles/17475620993300-What-is-Freemium' },
			{ name: 'Aura Call Protection', url: 'https://www.aura.com/spam-call-message-protection' }
		]
	},
	{
		href: '/voicemail-shield',
		label: '“Number disconnected” voicemail shield',
		free: 'Download a real North American SIT tone (the three “not in service” tones) as a WAV and record it into your voicemail greeting, with ready-to-read scripts.',
		paid: 'YouMail’s Ghosting plays an “out of service” message; auto-ghosting known spammers is for paid users. RoboKiller’s “Number Disconnected” Answer Bot needs Premium+.',
		sources: [
			{ name: 'YouMail Ghosting', url: 'https://www.youmail.com/features/ghosting/' },
			{ name: 'RoboKiller Answer Bots', url: 'https://support.robokiller.com/hc/en-us/articles/18763010932372-How-can-I-enable-or-disable-Answer-Bots' }
		]
	},
	{
		href: '/neighbor-spoof',
		label: 'Neighbor-spoof prefix blocker',
		free: 'Enter your area code + prefix to see real FTC/FCC-reported numbers that look like yours and download one blockable contact card (plus an optional custom range).',
		paid: 'Hiya lets free users only warn on area-code/prefix combos — blocking them needs Premium ($3.99/mo). Truecaller’s “Number Series” blocking is Premium-only. YouMail’s number-range blocking is for paid plans.',
		sources: [
			{ name: 'Hiya help center', url: 'https://spamblocker-support.hiya.com/en/articles/7-how-to-block-spam-calls-from-specific-area-codes-and-prefixes' },
			{ name: 'Truecaller support', url: 'https://support.truecaller.com/support/solutions/articles/81000418494-how-to-block-a-number-series-' }
		]
	},
	{
		href: '/exposure-check',
		label: 'People-search exposure check + privacy-law packet',
		free: 'Type your name and state (it never leaves your browser) to open “search yourself” links on major people-search sites, see if your state has a privacy deletion law, and print a ready-to-send deletion packet.',
		paid: 'DeleteMe ($129/yr), Incogni ($95.88/yr), and Aura (data removal on every plan, from $12/mo) sell scanning and removal; DeleteMe’s free scan leads into a paid plan.',
		sources: [
			{ name: 'Aura pricing', url: 'https://www.aura.com/pricing' },
			{ name: 'Incogni pricing', url: 'https://incogni.com/pricing' }
		]
	},
	{
		href: '/family-setup',
		label: 'Family & parent anti-scam setup kit',
		free: 'Pick a parent’s phone and carrier to print a large-type, one-page setup guide: built-in call screening, the carrier’s free spam filter, a trusted-contacts list, and a family safe-word card against AI voice-clone calls.',
		paid: 'Aura includes AI spam call & message protection on its Family plan ($32/mo); Truecaller Premium adds “Advanced Family Protection.”',
		sources: [
			{ name: 'Aura pricing', url: 'https://www.aura.com/pricing' },
			{ name: 'Truecaller Premium', url: 'https://www.truecaller.com/premium' }
		]
	}
];
