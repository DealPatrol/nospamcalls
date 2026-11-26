import * as S from "./sources";

const LINKS: Record<string, [string, string]> = {
	ftcReport: [S.FTC_REPORT, "ReportFraud.ftc.gov"],
	dnc: [S.DNC, "DoNotCall.gov"],
	fccStop: [S.FCC_STOP, "the FCC guide to stopping unwanted robocalls and texts"],
	fccComplaints: [S.FCC_COMPLAINTS, "FCC complaint form"],
	fccOneRing: [S.FCC_ONE_RING, "the FCC One-Ring Phone Scam guide"],
	fccPolitical: [S.FCC_POLITICAL, "the FCC political campaign robocall rules"],
	fccBlocking: [S.FCC_BLOCKING, "FCC call-blocking resources"],
	fccUnwanted: [S.FCC_UNWANTED, "FCC unwanted-communications enforcement page"],
	usaGov: [S.USA_GOV, "USA.gov telemarketer and scam-call complaints"],
	ssa: [S.SSA_SCAM, "SSA.gov/scam"],
	ftcSsa: [S.FTC_SSA, "FTC alert: your Social Security number is not suspended"],
	ftcApple: [S.FTC_APPLE, "FTC alert on fake Apple and Amazon support calls"],
	irs: [S.IRS_SCAMS, "IRS tax scams and consumer alerts"],
	irsPhish: [S.IRS_PHISH, "IRS instructions for reporting fake IRS messages"],
	medicare: [S.MEDICARE, "Medicare.gov fraud reporting"],
	cfpbDebt: [S.CFPB_DEBT, "CFPB guidance on spotting fake collectors"],
	cfpbComplaint: [S.CFPB_COMPLAINT, "CFPB complaint form"],
	apple: [S.APPLE_UNKNOWN, "Apple Support: Manage unknown callers on iPhone"],
	googleScreen: [S.GOOGLE_SCREEN, "Google Phone Help: Call Screen"],
	googleSpam: [S.GOOGLE_SPAM, "Google Phone Help: spam and Call Screen"],
	att: [S.ATT, "AT&T support for the ActiveArmor app"],
	verizon: [S.VERIZON, "Verizon Call Filter"],
	tmo: [S.TMO, "T-Mobile Scam Shield support"],
	ftcTexts: [S.FTC_TEXTS, "FTC Consumer Protection Data Spotlight: Top Text Scams of 2024"],
	tcpa: [S.TCPA_STATUTE, "47 U.S.C. § 227"],
	fccDelivery: [S.FCC_DELIVERY, "the FCC guide to package delivery scams"],
	uspis: [S.USPIS_SMISHING, "the U.S. Postal Inspection Service smishing alert"],
	uspsHoliday: [S.USPS_HOLIDAY_2026, "USPS holiday scam tips (Nov. 24, 2026)"]
};

/** Replace [[key]] placeholders with official links. Content is authored here, not user input. */
export function linkify(text: string): string {
	return text.replace(/\[\[([a-zA-Z]+)\]\]/g, (_, key: string) => {
		const pair = LINKS[key];
		if (!pair) return _;
		const [href, label] = pair;
		return `<a href="${href}" rel="noopener noreferrer">${label}</a>`;
	});
}

export function paragraphs(...parts: string[]): string {
	return parts.map((part) => `<p>${linkify(part)}</p>`).join("");
}

export function list(items: string[], ordered = false): string {
	const tag = ordered ? "ol" : "ul";
	return `<${tag}>${items.map((item) => `<li>${linkify(item)}</li>`).join("")}</${tag}>`;
}

export function block(...chunks: string[]): string {
	return chunks.join("");
}
