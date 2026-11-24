/** What is free today vs. held back for NoSpamCalls Pro (not launched, no price set, nothing charged). */
export const FREE_TODAY = [
	{ href: '/#lookup', label: 'Spam number lookup', text: 'Live FTC + FCC complaint counts and community reports for any U.S. number.' },
	{ href: '/blocklist', label: 'Personal blocklist + Top-100 .vcf', text: 'Report a number that slipped through and download one blockable contact.' },
	{ href: '/get-paid', label: 'TCPA settlements & demand letter', text: 'Verified open class-action settlements, damages estimator, evidence packet, demand letter.' },
	{ href: '/opt-out', label: 'Data-broker opt-out kit', text: '14 official opt-out links, California DROP, and a state-law deletion email generator.' },
	{ href: '/email-shield', label: 'Email header analyzer + Gmail filters', text: 'SPF/DKIM/DMARC and network-owner lookup, abuse report, downloadable Gmail filter file.' },
	{ href: '/setup', label: 'Phone & carrier setup wizard', text: 'iOS 26 Ask Reason for Calling, Android Call Screen, carrier filters, forwarding codes.' },
	{ href: '/text-scam-check', label: 'Scam text & link checker', text: 'Domain age (RDAP), look-alike and fake-brand links, scam phrases, FTC/FCC number check.' },
	{ href: '/neighbor-spoof', label: 'Neighbor-spoof prefix blocker', text: 'Reported look-alike numbers for your area code + prefix in one blockable contact.' },
	{ href: '/voicemail-shield', label: '“Disconnected” voicemail tone', text: 'Real SIT tone WAV plus greeting scripts and carrier steps.' },
	{ href: '/exposure-check', label: 'People-search exposure check', text: 'Search-yourself links, your state’s privacy law, and a printable deletion packet.' },
	{ href: '/family-setup', label: 'Family anti-scam setup kit', text: 'Printable large-type guide for a parent’s phone, plus a safe-word card.' }
] as const;

export const PRO_FEATURES = [
	{
		id: 'live_screening',
		label: 'Automatic live call screening',
		text: 'A screening line that answers unknown callers and automatically blocks numbers that slipped through — no .vcf re-imports.'
	},
	{
		id: 'broker_removal',
		label: 'Done-for-you data-broker removal',
		text: 'We send the removal requests for you and re-scan data brokers every month.'
	},
	{
		id: 'tcpa_recovery',
		label: 'Automated TCPA cash recovery',
		text: 'Calls logged automatically, the company behind them identified, and matched against open settlements.'
	},
	{
		id: 'family_protection',
		label: 'Family & aging-parent scam protection',
		text: 'Shield a parent’s phone and get caregiver alerts when a scam caller gets through.'
	}
] as const;

export type ProFeatureId = (typeof PRO_FEATURES)[number]['id'];
export const PRO_FEATURE_IDS: readonly string[] = PRO_FEATURES.map((f) => f.id);
