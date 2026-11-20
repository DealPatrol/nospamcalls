import type { Guide } from "./types";
import { block, list, paragraphs } from "./html";
import {
	DNC,
	FCC_BLOCKING,
	FCC_COMPLAINTS,
	FCC_STOP,
	FCC_UNWANTED,
	FTC_REPORT,
	IRS_PHISH,
	MEDICARE,
	SSA_SCAM,
	TCPA_STATUTE,
	USA_GOV
} from "./sources";

export const LEARN_GUIDES: Guide[] = [
	{
		slug: "scam-likely",
		path: "/scam-likely",
		section: "learn",
		title: "What does “Scam Likely” mean on a phone call?",
		description:
			"“Scam Likely” is a label your carrier or a call-blocking service places on a call it thinks is a scam. It is not a legal finding, and legitimate businesses are sometimes mislabeled.",
		headline: "What does “Scam Likely” mean?",
		answer:
			"“Scam Likely” (and similar labels such as “Spam Likely” or “Fraud”) is a warning from your phone carrier or a call-blocking service, not a court or government verdict. It means the call looks suspicious based on the carrier’s data. The label can be wrong in both directions: some scams still ring through, and some legitimate callers get flagged.",
		schema: "Article",
		crumbs: [{ href: "/scam-likely", label: "What “Scam Likely” means" }],
		faqs: [
			{
				q: "Who puts “Scam Likely” on the call?",
				a: "Usually your wireless carrier or a connected call-filtering app. The FCC requires carriers to implement caller-ID authentication (often discussed as STIR/SHAKEN) and allows call blocking and labeling tools. The exact words on your screen come from the carrier or app, not from NoSpamCalls."
			},
			{
				q: "If a call is labeled “Scam Likely,” is it definitely a scam?",
				a: "No. It is a risk score or reputation flag. Treat it as a reason to be careful, not as proof. If you were expecting a call from a business, you can look the official number up yourself and call back on that number."
			},
			{
				q: "My business is being labeled “Scam Likely.” What can I do?",
				a: "This is a known problem for some legitimate callers. Start with your carrier or the analytics provider your carrier uses, make sure your caller-ID authentication is set up, and avoid calling patterns that look like robocall traffic. NoSpamCalls has a free waitlist for businesses that want help with number reputation."
			},
			{
				q: "Does “Scam Likely” mean I should not answer?",
				a: "If you were not expecting the call, it is reasonable to let it go to voicemail. If you do answer and the caller pressures you for payment or personal data, hang up and use official channels instead."
			}
		],
		sections: [
			{
				heading: "A label, not a legal judgment",
				html: paragraphs(
					"When your iPhone or Android screen says Scam Likely, Spam Risk, or something similar, your carrier or a filtering service is trying to warn you. The FCC’s [[fccBlocking]] and [[fccStop]] explain that carriers may block or label calls they believe are unwanted or illegal. The flag is automated. It can miss a scam, and it can tag a real business, a school, a clinic, or a local government office.",
					"Caller ID can also be spoofed. A local area code, a familiar company name, or even a “Scam Likely” tag should not be your only test. If something is important, hang up and place a new call to a number you already have or look up independently."
				)
			},
			{
				heading: "What you should do as a consumer",
				html: paragraphs(
					'Let unexpected flagged calls go to voicemail. Use <a href="/block-spam-calls">spam-blocking tools</a> on your phone and carrier. Look up the number on NoSpamCalls and <a href="/report">report</a> scam or robocall activity. Report serious scams at [[ftcReport]] and illegal robocalls with the [[fccComplaints]].'
				)
			},
			{
				heading: "What you should know as a business",
				html: paragraphs(
					'If customers say your outbound calls show Scam Likely, that is a reputation and caller-ID authentication problem, not a NoSpamCalls label. Talk to the carrier that originates your calls about STIR/SHAKEN signing, registration, and any traceback or dispute process they offer. You can also <a href="/business">join the business waitlist</a> if you want to hear about a number-reputation service when it is ready.'
				)
			}
		],
		related: [
			{ href: "/block-spam-calls", label: "How to block spam calls" },
			{ href: "/business", label: "Business waitlist for Scam Likely flags" },
			{ href: "/report-spam-calls", label: "How to report spam calls" },
			{ href: "/area-code", label: "U.S. area-code directory" }
		],
		sources: [
			{ href: FCC_BLOCKING, label: "FCC: Call blocking tools and resources" },
			{ href: FCC_STOP, label: "FCC: Stop unwanted robocalls and texts" },
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" }
		]
	},
	{
		slug: "report-spam-calls",
		path: "/report-spam-calls",
		section: "learn",
		title: "How to report spam calls to the FTC, FCC, and your carrier",
		description:
			"Report phone scams to the FTC at ReportFraud.ftc.gov, illegal robocalls to the FCC, and scam texts to 7726. Here is the official path, plus how to log a number on NoSpamCalls.",
		headline: "How to report spam calls",
		answer:
			"Report a phone or text scam to the FTC at ReportFraud.ftc.gov. Report illegal robocalls and spoofed calls to the FCC at fcc.gov/complaints. Forward scam texts to 7726 (SPAM). Then you can also log the number on NoSpamCalls so other people can look it up.",
		schema: "HowTo",
		howToName: "How to report a spam or scam call in the United States",
		howToSteps: [
			{
				name: "Report the scam to the FTC",
				text: "Go to ReportFraud.ftc.gov and describe the call, text, or loss. This is the main U.S. consumer fraud report."
			},
			{
				name: "Report illegal robocalls to the FCC",
				text: "File a complaint at fcc.gov/complaints. Include the date, time, the number that appeared, and whether it was a cell phone or landline."
			},
			{
				name: "Forward scam texts to 7726",
				text: "Copy or forward the text to 7726 (SPAM) so your mobile carrier can review it."
			},
			{
				name: "Use targeted official channels when a government or company was impersonated",
				text: "For IRS impersonation, also use the IRS and TIGTA process. For Social Security, use SSA.gov/scam. For Medicare, call 1-800-MEDICARE. For debt-collection issues, you can also complain to the CFPB."
			},
			{
				name: "Log the number on NoSpamCalls",
				text: "File a public report so other people can look the number up. This does not replace official government reports."
			}
		],
		crumbs: [{ href: "/report-spam-calls", label: "How to report spam calls" }],
		faqs: [
			{
				q: "What is the difference between an FTC report and an FCC complaint?",
				a: "The FTC is the main place to report fraud and scams, including phone scams. The FCC handles complaints about illegal robocalls, spoofing, and certain unwanted-call rules. If you are unsure, you can file with both. USA.gov also summarizes these options."
			},
			{
				q: "Does reporting get the number shut off?",
				a: "Not automatically, and spoofed numbers may not belong to the original caller at all. Official reports still help agencies and carriers see patterns."
			},
			{
				q: "Should I also register for Do Not Call?",
				a: "Yes, at DoNotCall.gov, if you have not already. That registry is for reducing many telemarketing sales calls. It will not stop most scammers, and it is not the same as filing a fraud report."
			}
		],
		sections: [
			{
				heading: "Start with the official U.S. reports",
				html: paragraphs(
					"For a scam — someone tried to trick you, steal information, or take money — use [[ftcReport]]. That is the FTC’s official reporting site.",
					'For illegal robocalls, spoofed caller ID, or unwanted-call rule issues, use the [[fccComplaints]] or call the FCC at <a href="tel:+18882255322">1-888-225-5322</a> (1-888-CALL-FCC). [[usaGov]] summarizes both paths.',
					"Forward scam texts to 7726 (that spells SPAM on a phone keypad) so your carrier can see the message."
				)
			},
			{
				heading: "Add a specialized report when a specific agency was impersonated",
				html: block(
					list([
						'IRS or Treasury impersonation: [[irsPhish]] and TIGTA at <a href="tel:+18003664484">800-366-4484</a>. See also our <a href="/scams/irs-tax">IRS scam guide</a>.',
						'Social Security: [[ssa]] or the SSA OIG at <a href="tel:+18002690271">1-800-269-0271</a>.',
						'Medicare: [[medicare]] or <a href="tel:+18006334227">1-800-MEDICARE</a>.',
						'Debt collection: [[cfpbComplaint]] and our <a href="/scams/debt-collector">debt-collector guide</a>.'
					])
				)
			},
			{
				heading: "Register on the Do Not Call list and log the number here",
				html: paragraphs(
					'Register the phone that gets the calls at [[dnc]], or call <a href="tel:+18883821222">1-888-382-1222</a> from that phone. Then <a href="/report">file a NoSpamCalls report</a> if you want the number in this public lookup. Community reports do not replace FTC or FCC filings.'
				)
			}
		],
		related: [
			{ href: "/stop-spam-calls", label: "How to stop spam calls" },
			{ href: "/scams", label: "Scam call guides" },
			{ href: "/tcpa-rights", label: "Your rights under the TCPA" },
			{ href: "/report", label: "Report a number on NoSpamCalls" }
		],
		sources: [
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: FCC_COMPLAINTS, label: "FCC consumer complaints" },
			{ href: DNC, label: "National Do Not Call Registry" },
			{ href: USA_GOV, label: "USA.gov: Complain about phone and text scams" },
			{ href: SSA_SCAM, label: "SSA.gov/scam" },
			{ href: IRS_PHISH, label: "IRS: Report fake IRS messages" },
			{ href: MEDICARE, label: "Medicare.gov fraud reporting" }
		]
	},
	{
		slug: "tcpa-rights",
		path: "/tcpa-rights",
		section: "learn",
		title: "Your rights under the TCPA (not legal advice)",
		description:
			"A plain-English overview of the Telephone Consumer Protection Act, official FCC resources, and the statute’s private right of action. This is not legal advice.",
		headline: "Your rights under the TCPA",
		answer:
			"The Telephone Consumer Protection Act (TCPA) is a U.S. federal law, 47 U.S.C. § 227, that restricts certain autodialed and prerecorded calls and texts and works alongside Do Not Call rules. The statute includes a private right of action and mentions damages of $500 per violation, which can be tripled for willful or knowing violations. This page is general information, not legal advice, and it is not an offer to represent you or to evaluate a claim.",
		schema: "Article",
		crumbs: [{ href: "/tcpa-rights", label: "TCPA rights" }],
		faqs: [
			{
				q: "Is this legal advice?",
				a: "No. NoSpamCalls is not a law firm. This page summarizes official public sources so you can find them. Whether a call was legal, and what you can recover, depends on facts and current law. Talk with a licensed attorney about your situation."
			},
			{
				q: "What damages does the TCPA mention?",
				a: "The statute provides for $500 in damages for each violation and allows a court to increase that amount up to three times — $1,500 — for a willful or knowing violation. Those figures come from the statute; they are not a promise of what any person would receive."
			},
			{
				q: "Does the National Do Not Call Registry come from the TCPA?",
				a: "Do Not Call rules involve both the FTC and the FCC. The TCPA is an FCC-enforced communications statute. Registering at DoNotCall.gov is still one of the official consumer steps, but it does not by itself stop scammers or political calls."
			},
			{
				q: "Can NoSpamCalls file a TCPA case for me?",
				a: "No. We do not file lawsuits, scrub calling lists, or tell you that a particular call is a winning case. If you want legal help, consult a licensed attorney."
			}
		],
		sections: [
			{
				heading: "What the TCPA is",
				html: paragraphs(
					"The Telephone Consumer Protection Act is codified at [[tcpa]]. The FCC enforces TCPA rules and explains consumer options in [[fccStop]] and on its [[fccUnwanted]].",
					"In plain language, the law limits certain uses of automatic dialing systems and prerecorded or artificial voice messages, restricts certain texts, and works together with caller-ID and Do Not Call rules. Consent, the type of phone (cell versus landline), and specific exemptions can all matter. Those details are fact-specific and can change as the FCC updates rules or as courts interpret the statute."
				)
			},
			{
				heading: "The private right of action, in the statute’s own terms",
				html: paragraphs(
					"Section 227 of Title 47 allows a person to bring an action in an appropriate court for a violation and to recover the greater of actual monetary loss or $500 for each violation. If the court finds that the defendant willfully or knowingly violated the section, it may increase the award to not more than three times that amount.",
					"That is a description of the statute, not a prediction of your case. Deadlines, consent, exemptions, who made the call, and how it was dialed can all affect the outcome. Only a licensed attorney can advise you."
				)
			},
			{
				heading: "Practical steps that do not require a lawsuit",
				html: paragraphs(
					'Register at [[dnc]]. Use <a href="/block-spam-calls">blocking tools</a>. <a href="/report-spam-calls">Report scams and robocalls</a> to the FTC and FCC. Those steps are available whether or not you ever speak with a lawyer.'
				)
			},
			{
				heading: "Important disclaimer",
				html: paragraphs(
					"NoSpamCalls provides general consumer information. We are not a law firm, and nothing on this site creates an attorney-client relationship. We do not guarantee that any call was legal or illegal, or that anyone will recover money. Read the official FCC materials and the statute, and consult a licensed attorney for advice about your situation."
				)
			}
		],
		related: [
			{ href: "/report-spam-calls", label: "How to report spam calls" },
			{ href: "/stop-spam-calls", label: "How to stop spam calls" },
			{ href: "/scams/political-robocalls", label: "Political robocalls" },
			{ href: "/scams/debt-collector", label: "Debt collector scams" }
		],
		sources: [
			{ href: TCPA_STATUTE, label: "47 U.S.C. § 227 (Telephone Consumer Protection Act)" },
			{ href: FCC_STOP, label: "FCC: Stop unwanted robocalls and texts" },
			{ href: FCC_UNWANTED, label: "FCC: Unlawful communications / unwanted communications" },
			{ href: DNC, label: "National Do Not Call Registry" },
			{ href: FCC_COMPLAINTS, label: "FCC consumer complaints" }
		]
	}
];
