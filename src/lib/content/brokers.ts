/** Data brokers and people-search sites with opt-out pages checked live on Nov 23, 2026. */
export type Broker = {
	slug: string;
	name: string;
	covers?: string;
	optOutUrl: string;
	email?: string;
	steps: string;
	kind: 'people-search' | 'marketing-data';
};

export const BROKERS_CHECKED = '2026-11-23';

export const BROKERS: Broker[] = [
	{ slug: 'whitepages', name: 'Whitepages', optOutUrl: 'https://www.whitepages.com/suppression-requests', steps: 'Find your listing, paste its URL into the suppression request page, and follow the verification step Whitepages shows.', kind: 'people-search' },
	{ slug: 'spokeo', name: 'Spokeo', optOutUrl: 'https://www.spokeo.com/optout', steps: 'Find your Spokeo listing, paste its URL and your email on the opt-out page, then confirm from the email Spokeo sends.', kind: 'people-search' },
	{ slug: 'truepeoplesearch', name: 'TruePeopleSearch', optOutUrl: 'https://www.truepeoplesearch.com/removal', steps: 'Enter your email, search your name, choose “Remove this record,” then click the emailed verification link. The site says to allow 3 days.', kind: 'people-search' },
	{ slug: 'fastpeoplesearch', name: 'FastPeopleSearch', optOutUrl: 'https://www.fastpeoplesearch.com/removal', steps: 'Enter your name and email, click the emailed link within 24 hours, then fill out the opt-out form. The site says to allow 3 days.', kind: 'people-search' },
	{ slug: 'fastbackgroundcheck', name: 'FastBackgroundCheck', optOutUrl: 'https://www.fastbackgroundcheck.com/opt-out', steps: 'Same flow as FastPeopleSearch: name + email, emailed link, then the opt-out form.', kind: 'people-search' },
	{ slug: 'usphonebook', name: 'USPhoneBook', optOutUrl: 'https://www.usphonebook.com/removal', steps: 'Enter your name and email, click the emailed link, then submit the opt-out form for your record.', kind: 'people-search' },
	{ slug: 'beenverified', name: 'BeenVerified', optOutUrl: 'https://support.beenverified.com/hc/en-us/articles/222411908-How-do-I-remove-my-name-from-BeenVerified-s-people-search-results', email: 'privacy@beenverified.com', steps: 'Use the “Click Here” opt-out link in BeenVerified’s help article, select your record, then confirm by email. The online form removes one record; email privacy@beenverified.com for more.', kind: 'people-search' },
	{ slug: 'peopleconnect', name: 'PeopleConnect Suppression Center', covers: 'Intelius, Instant Checkmate, TruthFinder, US Search', optOutUrl: 'https://suppression.peopleconnect.us/login', steps: 'One request covers Intelius, Instant Checkmate, TruthFinder, and US Search. Verify your email, find your record, then set it to “Suppressed” and save.', kind: 'people-search' },
	{ slug: 'nuwber', name: 'Nuwber', optOutUrl: 'https://nuwber.com/removal/link', email: 'support@nuwber.com', steps: 'Find your listing, copy its URL, paste it into the removal page, and confirm by email. Each listing is removed separately.', kind: 'people-search' },
	{ slug: 'peoplefinders', name: 'PeopleFinders', optOutUrl: 'https://www.peoplefinders.com/opt-out', steps: 'Enter your name and email, then complete the removal form from the emailed link.', kind: 'people-search' },
	{ slug: 'thatsthem', name: 'ThatsThem', optOutUrl: 'https://thatsthem.com/optout', steps: 'Submit the opt-out form with your details. The site says requests are usually processed within 72 hours.', kind: 'people-search' },
	{ slug: 'lexisnexis', name: 'LexisNexis Risk Solutions', optOutUrl: 'https://consumer.risk.lexisnexis.com/opt', steps: 'Submit the consumer opt-out request form on the LexisNexis consumer portal.', kind: 'marketing-data' },
	{ slug: 'acxiom', name: 'Acxiom', optOutUrl: 'https://isapps.acxiom.com/optout/optout.aspx', steps: 'Fill out Acxiom’s marketing-data opt-out form with each name, address, phone, and email you want covered.', kind: 'marketing-data' },
	{ slug: 'epsilon', name: 'Epsilon', optOutUrl: 'https://legal.epsilon.com/dsr', steps: 'Use Epsilon’s Data Subject Request page to ask for deletion and an opt-out of marketing data.', kind: 'marketing-data' }
];

export const REGISTRIES = [
	{ name: 'California DROP (Delete Request and Opt-out Platform)', url: 'https://privacy.ca.gov/drop/', note: 'California residents: one free request goes to every registered data broker. Since August 1, 2026, brokers must check the DROP list at least every 45 days.' },
	{ name: 'National Do Not Call Registry', url: 'https://www.donotcall.gov/', note: 'Free. Stops most legal telemarketing after 31 days. Scammers ignore it, but it is the basis for TCPA Do-Not-Call claims.' },
	{ name: 'OptOutPrescreen', url: 'https://www.optoutprescreen.com/', note: 'Free. Stops prescreened credit and insurance offers for 5 years online, or permanently with the signed mail-in form.' },
	{ name: 'DMAchoice', url: 'https://www.dmachoice.org/', note: 'Cuts marketing mail from participating companies. Costs $8 online for 10 years ($9 by mail).' }
];
