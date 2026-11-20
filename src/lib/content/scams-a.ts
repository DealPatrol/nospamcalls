import type { Guide } from "./types";
import { block, list, paragraphs } from "./html";
import { FCC_COMPLAINTS, FTC_REPORT, FTC_SSA, IRS_PHISH, IRS_SCAMS, MEDICARE, SSA_SCAM } from "./sources";

const scam = (slug: string, label: string) => [
	{ href: "/scams", label: "Scam call guides" },
	{ href: `/scams/${slug}`, label }
];

export const SCAMS_A: Guide[] = [
	{
		slug: "irs-tax",
		path: "/scams/irs-tax",
		section: "scams",
		title: "IRS and tax call scams",
		description:
			"The IRS will not call to demand gift cards, crypto, or immediate payment under threat of arrest. How to spot a fake IRS call and where to report it.",
		headline: "IRS and tax call scams: what they sound like and what to do",
		answer:
			"The IRS does not call, text, or email to demand immediate payment with a gift card, cryptocurrency, or wire, or to threaten arrest. Hang up, look up the IRS yourself, and report the contact to the Treasury Inspector General for Tax Administration and the FTC.",
		schema: "Article",
		crumbs: scam("irs-tax", "IRS and tax scams"),
		faqs: [
			{
				q: "Will the IRS call me about a tax bill?",
				a: "The IRS may call in limited situations after it has already mailed you, but it will not demand immediate payment by gift card, cryptocurrency, or wire, and it will not threaten to arrest you on the spot. If you were not expecting a call, hang up and use a phone number or website you look up yourself."
			},
			{
				q: "What number do I call to check a tax scam?",
				a: "Report suspected IRS impersonation to the Treasury Inspector General for Tax Administration at 800-366-4484, and report the contact at ReportFraud.ftc.gov. For a real tax question, use IRS.gov or a number published there — not a number from the unexpected call."
			},
			{
				q: "Can I look up the number that claimed to be the IRS?",
				a: "Yes. Search the number on NoSpamCalls and report it if it was a scam. Remember that caller ID can be spoofed, so a number that looks official is not proof the IRS called you."
			}
		],
		sections: [
			{
				heading: "What an IRS or tax scam call is",
				html: paragraphs(
					"Tax impersonation calls, texts, or voicemails pretend to be the Internal Revenue Service, a state tax agency, or a tax-preparation brand. The goal is usually to scare you into paying or into giving your Social Security number, bank details, or a one-time passcode.",
					"The IRS publishes [[irs]] describing these tricks. A common script claims you owe a tax debt, that a lawsuit or arrest warrant is already in motion, or that you must stay on the line to protect a refund."
				)
			},
			{
				heading: "Warning signs",
				html: block(
					list([
						"The caller demands payment right now with a gift card, cryptocurrency, wire transfer, or a payment app.",
						"You are told not to hang up, not to tell anyone, or that police are on the way.",
						"The caller ID shows “IRS,” “Treasury,” or a local-looking number — caller ID is easy to spoof.",
						"You are asked to read back a code, confirm your Social Security number, or share online account passwords.",
						"The first contact is a threat. The IRS generally starts with mail, not a surprise demand for instant payment."
					]),
					paragraphs(
						"None of these signs replace official advice. When in doubt, hang up and use [[irs]] or a number you find on IRS.gov."
					)
				)
			},
			{
				heading: "What to do if you already picked up or paid",
				html: paragraphs(
					"Hang up. Do not call back a number left on voicemail unless you have independently confirmed it. Do not send more money or share more information.",
					"If you gave a bank or card number, contact that financial institution immediately. If you paid with a gift card, contact the card issuer and report it. If you shared a Social Security number, review the FTC identity-theft steps at [[ftcReport]] and consider a credit freeze.",
					'Report fake IRS calls, texts, and emails using [[irsPhish]]. The IRS directs people to report suspicious calls to the Treasury Inspector General for Tax Administration (TIGTA) at <a href="tel:+18003664484">800-366-4484</a>. Also file a report at [[ftcReport]] and, for illegal robocalls, with the [[fccComplaints]].'
				)
			},
			{
				heading: "How to check whether a tax contact is real",
				html: paragraphs(
					"Look up IRS.gov yourself. Do not use a link or callback number from the unexpected message. If you have a tax professional, ask them. If you truly owe a balance, official notices and payment options are described on the IRS site — not in a rushed phone threat."
				)
			}
		],
		related: [
			{ href: "/scams/social-security", label: "Social Security scams" },
			{ href: "/scams/bank-fraud-alert", label: "Fake bank fraud-alert calls and texts" },
			{ href: "/report-spam-calls", label: "How to report spam calls" },
			{ href: "/tcpa-rights", label: "Your rights under the TCPA" }
		],
		sources: [
			{ href: IRS_SCAMS, label: "IRS: Tax scams / consumer alerts" },
			{ href: IRS_PHISH, label: "IRS: Report fake IRS, Treasury, or tax-related messages" },
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: FCC_COMPLAINTS, label: "FCC consumer complaints" }
		]
	},
	{
		slug: "social-security",
		path: "/scams/social-security",
		section: "scams",
		title: "Social Security call scams",
		description:
			"Your Social Security number cannot be suspended. How to recognize SSA impersonation calls and how to report them to SSA’s Office of the Inspector General and the FTC.",
		headline: "Social Security scams: your number is not suspended",
		answer:
			"The Social Security Administration will not call to say your Social Security number has been suspended or to demand payment by gift card or cryptocurrency. Hang up, and report the contact at SSA.gov/scam and ReportFraud.ftc.gov.",
		schema: "Article",
		crumbs: scam("social-security", "Social Security scams"),
		faqs: [
			{
				q: "Can Social Security suspend my Social Security number?",
				a: "No. The FTC and SSA have been clear: your Social Security number cannot be suspended, frozen, or blocked because of a crime or a missed call. That claim is a scam."
			},
			{
				q: "What is the real Social Security phone number?",
				a: "SSA’s national number is 1-800-772-1213. Use it only after you look it up yourself or find it on SSA.gov. Do not call a number from a suspicious voicemail or text. Report scams to the SSA Office of the Inspector General at 1-800-269-0271 or SSA.gov/scam."
			},
			{
				q: "What if I already gave my Social Security number?",
				a: "Hang up and stop sharing information. Report the contact to SSA’s OIG and the FTC, and review FTC identity-theft guidance, including a credit freeze if your number was exposed."
			}
		],
		sections: [
			{
				heading: "What these calls claim",
				html: paragraphs(
					"Social Security impersonators often say your number was used in a crime, that your benefits will stop today, or that your Social Security number has been “suspended.” [[ftcSsa]] and [[ssa]] both warn that this story is false.",
					"The caller may already know part of your name or date of birth, may spoof an 800 number, and may offer to transfer you to a fake office of the inspector general. The goal is fear, then payment or personal data."
				)
			},
			{
				heading: "Warning signs",
				html: block(
					list([
						"You are told your Social Security number is suspended, canceled, or flagged, and you must act this minute.",
						"Payment is demanded by gift card, cryptocurrency, wire, or a cash-reload product.",
						"The caller tells you to keep the conversation secret or to stay on the line while you drive to a store.",
						"You are asked for your full Social Security number, bank login, or a one-time passcode."
					]),
					paragraphs(
						"SSA may contact people in some cases about their benefits, but it will not use these scare-and-pay tactics. When a call surprises you, hang up and use [[ssa]]."
					)
				)
			},
			{
				heading: "What to do and where to report",
				html: paragraphs(
					'Hang up. Do not call back the number on caller ID or voicemail. If you need to reach Social Security, use <a href="tel:+18007721213">1-800-772-1213</a> or the contact options on SSA.gov.',
					'Report the contact to the SSA Office of the Inspector General at <a href="tel:+18002690271">1-800-269-0271</a> or through [[ssa]]. Also file a report at [[ftcReport]]. For illegal robocalls, use the [[fccComplaints]].',
					'You can also <a href="/report">report the number on NoSpamCalls</a> so other people can look it up. Caller ID may still be spoofed.'
				)
			}
		],
		related: [
			{ href: "/scams/irs-tax", label: "IRS and tax call scams" },
			{ href: "/scams/medicare", label: "Medicare scams" },
			{ href: "/report-spam-calls", label: "How to report spam calls" },
			{ href: "/scam-likely", label: "What “Scam Likely” means" }
		],
		sources: [
			{ href: SSA_SCAM, label: "Social Security Administration: Protect yourself from scams" },
			{ href: FTC_SSA, label: "FTC: Your Social Security number isn’t suspended — ever" },
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: FCC_COMPLAINTS, label: "FCC consumer complaints" }
		]
	},
	{
		slug: "medicare",
		path: "/scams/medicare",
		section: "scams",
		title: "Medicare call and card scams",
		description:
			"How to recognize fake Medicare calls about new cards, genetic tests, or “free” equipment, and how to report Medicare fraud to 1-800-MEDICARE.",
		headline: "Medicare scams: fake cards, tests, and “free” equipment",
		answer:
			"Treat unexpected calls about your Medicare number, a new or “updated” card, genetic testing, or free medical equipment as suspicious. Hang up, and call 1-800-MEDICARE (1-800-633-4227) or use Medicare.gov — not a number from the call.",
		schema: "Article",
		crumbs: scam("medicare", "Medicare scams"),
		faqs: [
			{
				q: "Will Medicare call me and ask for my Medicare number?",
				a: "Do not give your Medicare number or bank information to someone who called you out of the blue. If you need to check whether a contact is real, call 1-800-MEDICARE or sign in at Medicare.gov using a method you already trust."
			},
			{
				q: "How do I report Medicare fraud?",
				a: "Call 1-800-MEDICARE (1-800-633-4227) and follow the official instructions on Medicare.gov for reporting fraud and abuse. You can also report related scams to the FTC at ReportFraud.ftc.gov."
			},
			{
				q: "Are “free” genetic tests or braces a red flag?",
				a: "Unsolicited offers of free tests, braces, or medical equipment in exchange for your Medicare number are a common fraud pattern. Check with 1-800-MEDICARE or your own doctor before sharing information or agreeing to anything."
			}
		],
		sections: [
			{
				heading: "How Medicare impersonation usually works",
				html: paragraphs(
					"Callers may pose as Medicare, a health plan, or a medical supplier. They may claim your card is being replaced, that you qualify for a free genetic test or back brace, or that your benefits will stop unless you verify your Medicare number on the spot.",
					"Real benefit questions belong on [[medicare]] or with a plan or doctor you already know — not with an unexpected caller."
				)
			},
			{
				heading: "Warning signs",
				html: list([
					"An unsolicited call, text, or door visit asks for your Medicare number, bank account, or Social Security number.",
					"You are offered free equipment, tests, or rides if you share your Medicare details.",
					"The caller pressures you to enroll, switch plans, or pay a fee immediately.",
					"You are told not to talk to your doctor, pharmacist, or family first."
				])
			},
			{
				heading: "What to do",
				html: paragraphs(
					'Hang up. Call <a href="tel:+18006334227">1-800-MEDICARE</a> (1-800-633-4227) or use [[medicare]] to report suspected fraud and to check your claims or card status.',
					'If you already shared a number or made a payment, tell 1-800-MEDICARE and your financial institution, and file a report at [[ftcReport]]. You can also <a href="/report">log the calling number here</a>.'
				)
			}
		],
		related: [
			{ href: "/scams/social-security", label: "Social Security scams" },
			{ href: "/scams/irs-tax", label: "IRS and tax scams" },
			{ href: "/report-spam-calls", label: "How to report spam calls" }
		],
		sources: [
			{ href: MEDICARE, label: "Medicare.gov: Reporting Medicare fraud and abuse" },
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: SSA_SCAM, label: "SSA.gov/scam (related government impersonation)" }
		]
	}
];
