import type { Guide } from "./types";
import { block, list, paragraphs } from "./html";
import {
	CFPB_COMPLAINT,
	CFPB_DEBT,
	DNC,
	FCC_COMPLAINTS,
	FCC_POLITICAL,
	FCC_STOP,
	FTC_APPLE,
	FTC_REPORT,
	FTC_TEXTS,
	FCC_DELIVERY,
	USA_GOV,
	USPIS_SMISHING,
	USPS_HOLIDAY_2026
} from "./sources";

const scam = (slug: string, label: string) => [
	{ href: "/scams", label: "Scam call guides" },
	{ href: `/scams/${slug}`, label }
];

export const SCAMS_D: Guide[] = [
	{
		slug: "debt-collector",
		path: "/scams/debt-collector",
		section: "scams",
		title: "Debt collector scams versus real collectors",
		description:
			"How to tell a fake debt collector from a legitimate one, what pressure tactics are red flags, and how to report problems to the CFPB and FTC. This is not legal advice.",
		headline: "Debt collector calls: spotting scams and knowing official options",
		answer:
			"A caller who demands immediate payment by gift card or cryptocurrency, threatens arrest, or refuses to give a company name and mailing address is a major red flag. Real collection is subject to federal rules. Use CFPB and FTC resources, and get legal advice about your own debts.",
		schema: "Article",
		crumbs: scam("debt-collector", "Debt collector scams"),
		faqs: [
			{
				q: "Can a debt collector have me arrested if I do not pay today?",
				a: "Threatening arrest to collect a consumer debt is a serious red flag and may be illegal. Do not pay a caller out of fear. Use official CFPB guidance and, if needed, a licensed attorney or legal-aid organization."
			},
			{
				q: "How do I check whether a collector is real?",
				a: "The CFPB explains that you can ask for the company’s name, address, and details about the debt, and you can request written validation. Look up the company yourself. Do not use only a number or link the caller provides."
			},
			{
				q: "Where do I report a fake or abusive collector?",
				a: "Report scams at ReportFraud.ftc.gov. Submit a complaint to the CFPB as well. If the call was an illegal robocall, you can also complain to the FCC."
			}
		],
		sections: [
			{
				heading: "Scam collectors vs. legitimate collection",
				html: paragraphs(
					"Some calls are outright impersonation: there is no real debt, or the caller is fishing for payment and personal data. Other calls may come from a real collector but still use tactics the law does not allow. [[cfpbDebt]] walks through questions that help you sort this out.",
					"This page is general information, not legal advice, and it cannot tell you whether you owe a particular debt."
				)
			},
			{
				heading: "Red flags",
				html: list([
					"Payment is demanded by gift card, cryptocurrency, wire, or a cash-reload product.",
					"The caller threatens arrest, deportation, or a surprise visit today if you do not pay.",
					"The caller will not provide a company name, a mailing address, or a way to receive written details about the debt.",
					"You are told not to talk to anyone else or not to hang up."
				])
			},
			{
				heading: "What to do",
				html: paragraphs(
					"You can ask for written information and take time to review it. Look up the company independently. If you have an attorney or a nonprofit credit counselor, ask them.",
					"Report suspected scams at [[ftcReport]] and through the [[cfpbComplaint]]. For robocalls, also use the [[fccComplaints]]. If you want advice about a debt or about your rights, consult a licensed attorney."
				)
			}
		],
		related: [
			{ href: "/tcpa-rights", label: "Your rights under the TCPA" },
			{ href: "/report-spam-calls", label: "How to report spam calls" },
			{ href: "/scams/irs-tax", label: "IRS and tax scams" }
		],
		sources: [
			{ href: CFPB_DEBT, label: "CFPB: How do I tell if a debt collector is legitimate or a scam?" },
			{ href: CFPB_COMPLAINT, label: "CFPB complaint form" },
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: FCC_COMPLAINTS, label: "FCC consumer complaints" }
		]
	},
	{
		slug: "political-robocalls",
		path: "/scams/political-robocalls",
		section: "scams",
		title: "Political robocalls and robotexts",
		description:
			"Political calls are treated differently from sales calls, including on the National Do Not Call Registry. Here is what the FCC says, and how to report illegal campaign calls or texts.",
		headline: "Political robocalls and robotexts: what the FCC says",
		answer:
			"Political calls are generally not covered by the National Do Not Call Registry. The FCC still has rules about autodialed or prerecorded calls and texts, especially to cell phones. This is a summary of official FCC guidance, not legal advice.",
		schema: "Article",
		crumbs: scam("political-robocalls", "Political robocalls"),
		faqs: [
			{
				q: "Will registering on the Do Not Call list stop political calls?",
				a: "Usually no. The FTC and FCC treat political calls differently from most telemarketing sales calls. The National Do Not Call Registry is still useful for reducing many sales calls, but it is not a complete political-call filter."
			},
			{
				q: "Can campaigns text or robocall my cell phone?",
				a: "The FCC’s political-call guide explains that political campaign-related autodialed or prerecorded calls or texts to mobile phones generally require prior express consent, with details and exceptions described on that official page. Read the FCC guide for the current rule, and consult an attorney if you need advice about a specific call."
			},
			{
				q: "How do I report a political robocall or robotext?",
				a: "You can file a complaint with the FCC and, for scam or spoofed messages that are not really from a campaign, with the FTC. Reply STOP to unwanted texts only if you are comfortable doing so; the FCC also discusses that option in its guide."
			}
		],
		sections: [
			{
				heading: "How political calls differ from sales calls",
				html: paragraphs(
					"[[fccPolitical]] is the official consumer explanation of campaign robocalls, robotexts, and related rules. Two points people often miss: political calls are generally not covered by the National Do Not Call Registry, and the rules can differ for landlines and mobile phones.",
					"The FCC has stated that political campaign-related autodialed or prerecorded voice calls or texts to mobile phones, pagers, or services where the recipient is charged are prohibited unless the caller has prior express consent. The same official guide discusses landline rules and identification requirements. Those details can change, so read the FCC page for the current standard."
				)
			},
			{
				heading: "Messages that only pretend to be political",
				html: paragraphs(
					"Some messages borrow a campaign or official-sounding name to push a donation link, a survey that collects bank information, or a threat. Treat payment requests, gift-card demands, and unexpected donation links with the same caution you would use for any impersonation, and report them at [[ftcReport]]."
				)
			},
			{
				heading: "How to reduce and report them",
				html: paragraphs(
					'You can silence unknown callers and use carrier spam tools — see <a href="/block-spam-calls">block spam calls</a>. For texts you recognize as campaign messages you no longer want, the FCC notes you can reply STOP.',
					"File illegal-call or illegal-text complaints with the [[fccComplaints]]. Include the date, time, the number, and whether the line was a cell phone or a landline when you can."
				)
			}
		],
		related: [
			{ href: "/tcpa-rights", label: "Your rights under the TCPA" },
			{ href: "/block-spam-calls", label: "How to block spam calls" },
			{ href: "/report-spam-calls", label: "How to report spam calls" },
			{ href: "/stop-spam-calls", label: "Do Not Call and other stop-spam steps" }
		],
		sources: [
			{ href: FCC_POLITICAL, label: "FCC: Political campaign robocalls and robotexts rules" },
			{ href: FCC_STOP, label: "FCC: Stop unwanted robocalls and texts" },
			{ href: FCC_COMPLAINTS, label: "FCC consumer complaints" },
			{ href: DNC, label: "National Do Not Call Registry" }
		]
	},
	{
		slug: "utility-tech-support",
		path: "/scams/utility-tech-support",
		section: "scams",
		title: "Utility shutoff and tech-support call scams",
		description:
			"Unsolicited calls about a same-day power shutoff or a virus on your computer are classic imposter scams. Hang up and contact the company using a number on your bill.",
		headline: "Utility shutoff and tech-support scams",
		answer:
			"If someone you did not contact calls to say your electricity, gas, or water will be shut off today unless you pay, or that your computer is infected, hang up. Real utilities and software makers do not demand gift cards. Call the company using the number on your bill or in the official app.",
		schema: "Article",
		crumbs: scam("utility-tech-support", "Utility and tech-support scams"),
		faqs: [
			{
				q: "Will my utility demand gift cards to stop a shutoff?",
				a: "No. A same-day shutoff threat plus a request for gift cards, cryptocurrency, or a wire is a classic imposter scam. Use the phone number printed on a recent bill or the official app or website you already use."
			},
			{
				q: "What about “Microsoft” or “Apple” computer-virus calls?",
				a: "Unsolicited tech-support calls that ask for remote access or payment are a well-known scam. Hang up, and do not install software the inbound caller recommends. If you use the real company, reach it through official support pages you navigate to yourself."
			},
			{
				q: "Where should I report these calls?",
				a: "Report them at ReportFraud.ftc.gov and, for robocalls, to the FCC. If you already paid or granted remote access, contact your bank and, if needed, a technician you chose yourself."
			}
		],
		sections: [
			{
				heading: "Two common scripts",
				html: paragraphs(
					"Utility imposters claim a past-due bill and a shutoff within hours unless you pay immediately, often by gift card or a transfer. Tech-support imposters claim a virus, a license problem, or unusual activity and then ask for remote access or payment.",
					"In both cases the caller wants urgency so you will not look up the real company. Official consumer advice is consistent: hang up and use a number or site you already trust."
				)
			},
			{
				heading: "What to do",
				html: paragraphs(
					"Hang up. Find a recent utility bill, the official app, or a website you type yourself and ask whether your service is really at risk. For a computer warning, you can ignore the inbound call and, if you want a checkup, use a local shop or technician you choose.",
					'If you already paid or gave access, contact your financial institution, change passwords from a different device if needed, and report the incident at [[ftcReport]]. File robocall complaints with the [[fccComplaints]]. Related brand-impersonation patterns are also covered in our <a href="/scams/amazon-apple">Apple and Amazon support guide</a>.'
				)
			}
		],
		related: [
			{ href: "/scams/amazon-apple", label: "Fake Apple and Amazon support" },
			{ href: "/scams/bank-fraud-alert", label: "Fake bank fraud alerts" },
			{ href: "/report-spam-calls", label: "How to report spam calls" }
		],
		sources: [
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: FTC_APPLE, label: "FTC: Fake Apple and Amazon support calls" },
			{ href: FCC_COMPLAINTS, label: "FCC consumer complaints" },
			{ href: USA_GOV, label: "USA.gov: Complain about phone and text scams" }
		]
	},
	{
		slug: "package-delivery-tariff-text",
		path: "/scams/package-delivery-tariff-text",
		section: "scams",
		title: "Package “Stuck in Customs” or Tariff Fee Text? It’s Likely a Scam",
		description:
			"Got a text saying your package is held, stuck in customs, or needs a tariff or redelivery fee? The FCC and USPS warn these are common holiday scams. Don’t tap the link. Here’s how to check and report it.",
		headline: "Fake package delivery, customs, and tariff-fee texts",
		answer:
			"An unexpected text saying your package is held, “stuck in customs,” or needs a tariff, duty, or redelivery fee is very likely a scam. Do not tap the link, reply, or call the number in it. Check the tracking number in your original order email or on the carrier’s official site or app that you open yourself. Forward the text to 7726 (SPAM) and report it at ReportFraud.ftc.gov.",
		schema: "HowTo",
		howToName: "How to check a package delivery or tariff-fee text safely",
		howToSteps: [
			{ name: "Do not tap or reply", text: "Leave the link, the callback number, and any “reply Y” request alone. Replying can confirm your number is active." },
			{ name: "Check the order yourself", text: "Open the original order confirmation from the store, or type the carrier’s website or open its official app, and look up the tracking number there." },
			{ name: "Ask the seller about fees", text: "If you think import duties may apply, ask the merchant or marketplace you bought from. Legitimate sellers disclose extra fees up front or include them in the price." },
			{ name: "Report it", text: "Forward the text to 7726 (SPAM), report it at ReportFraud.ftc.gov, and for USPS-themed texts follow the Postal Inspection Service guidance. Then delete it." }
		],
		crumbs: scam("package-delivery-tariff-text", "Package and tariff-fee texts"),
		faqs: [
			{
				q: "Does USPS text you to pay a customs or tariff fee?",
				a: "Do not trust a link in an unexpected text that claims to be from USPS. The Postal Service tells customers not to click links or give personal information in response to texts claiming to come from USPS. Track packages yourself at usps.com or in the official app."
			},
			{
				q: "Why are tariff and customs texts showing up now?",
				a: "The FCC warns that scammers are using confusion over import duties to claim an order is stuck in customs until a tariff is paid. Holiday shopping means many people really are waiting on deliveries, so the message feels believable."
			},
			{
				q: "I paid the fee or entered my card. What now?",
				a: "Call your card issuer or bank using the number on your card, dispute the charge, and ask for a new card. Change any password you typed into the fake site, and report the scam at ReportFraud.ftc.gov."
			},
			{
				q: "Is a $1–$3 redelivery fee a sign of a scam?",
				a: "A small fee is a common hook because it seems harmless, but the real goal is usually your full card number and personal details. Treat any unexpected request to pay for delivery by text link as suspicious."
			}
		],
		sections: [
			{
				heading: "What these texts look like",
				html: block(
					paragraphs(
						"The message usually says a package could not be delivered, the address is incomplete, or the order is “stuck in customs” until you pay a small tariff, duty, or redelivery fee. It links to a site that copies USPS, UPS, FedEx, DHL, or a store’s branding and asks for your card and address.",
						"[[fccDelivery]] says scammers have adjusted delivery texts to claim you owe a tariff before an order can be delivered, and [[ftcTexts]] lists fake package-delivery problems among the most-reported text scams."
					),
					list([
						"It arrives when you did not expect a problem, often from an unfamiliar number or email address.",
						"It pushes urgency: pay today or the package is returned or destroyed.",
						"The link uses a look-alike or shortened web address, not the carrier’s real site.",
						"The fee is small, so paying feels easier than checking."
					])
				)
			},
			{
				heading: "The safe way to check",
				html: paragraphs(
					"Ignore the link. Open your original order confirmation, or type the carrier’s web address yourself, and enter the tracking number there. If you think duties may apply to an imported order, ask the seller directly. Legitimate companies tell you about extra fees up front.",
					'Not sure about a link? Paste the text into our free <a href="/text-scam-check">scam text and link checker</a>, which inspects the link without opening it. The same playbook applies to <a href="/scams/toll-road-text">fake unpaid-toll texts</a>.'
				)
			},
			{
				heading: "How to report it",
				html: paragraphs(
					"Forward the text to 7726 (SPAM) so your carrier can block similar messages, then report it at [[ftcReport]]. For USPS-themed messages, see [[uspis]] and [[uspsHoliday]]. You can also file a complaint with the [[fccComplaints]]."
				)
			}
		],
		related: [
			{ href: "/scams/toll-road-text", label: "Fake unpaid-toll texts" },
			{ href: "/scams/amazon-apple", label: "Fake Apple and Amazon support" },
			{ href: "/text-scam-check", label: "Free scam text and link checker" },
			{ href: "/report-spam-calls", label: "How to report spam calls and texts" }
		],
		sources: [
			{ href: FCC_DELIVERY, label: "FCC: How to avoid package delivery scams" },
			{ href: USPIS_SMISHING, label: "USPIS: Smishing package-tracking text scams" },
			{ href: USPS_HOLIDAY_2026, label: "USPS: Tips to avoid holiday scams (Nov. 24, 2026)" },
			{ href: FTC_TEXTS, label: "FTC Data Spotlight: Top text scams" },
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" }
		]
	}
];
