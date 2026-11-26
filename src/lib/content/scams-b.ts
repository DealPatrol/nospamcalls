import type { Guide } from "./types";
import { block, list, paragraphs } from "./html";
import { DNC, FCC_COMPLAINTS, FCC_STOP, FTC_APPLE, FTC_REPORT, FTC_TEXTS } from "./sources";

const scam = (slug: string, label: string) => [
	{ href: "/scams", label: "Scam call guides" },
	{ href: `/scams/${slug}`, label }
];

export const SCAMS_B: Guide[] = [
	{
		slug: "car-warranty",
		path: "/scams/car-warranty",
		section: "scams",
		title: "Car warranty robocall scams",
		description:
			"Those “your car warranty is about to expire” robocalls are a well-known telemarketing and scam pattern. Do not press 1. Here is what to do instead.",
		headline: "Car warranty robocalls: why you can hang up",
		answer:
			"An unexpected robocall about an expiring car warranty is a common pitch, not a notice from your automaker. Do not press 1, do not give your VIN or a payment card to the inbound caller, and report the call to the FTC and FCC.",
		schema: "Article",
		crumbs: scam("car-warranty", "Car warranty robocalls"),
		faqs: [
			{
				q: "Are car warranty robocalls illegal?",
				a: "Many auto-warranty robocalls have been the subject of FTC and state enforcement, especially when they use prerecorded messages, spoofed numbers, or misleading claims. Whether a specific call broke the law depends on the facts. Report it to the FTC and FCC, and talk to an attorney if you want advice about your own situation."
			},
			{
				q: "Should I press 1 to talk to an agent or to be taken off the list?",
				a: "No. Pressing a key often flags your number as active and can lead to more calls. Hang up instead, and use official reporting channels."
			},
			{
				q: "How do I check a real vehicle warranty?",
				a: "Use the paperwork from your dealer or automaker, or contact the manufacturer or selling dealer through a number or site you look up yourself — not a number from a robocall."
			}
		],
		sections: [
			{
				heading: "What the call usually sounds like",
				html: paragraphs(
					"The recording typically says your vehicle warranty or extended service contract is about to expire and that you should press a key to speak with a representative. The caller ID may show a nearby area code. That local number is often spoofed.",
					"These calls are trying to sell a service contract or to collect a vehicle identification number, billing data, or a callback from a live person. They are not a reliable notice from the company that built or sold your car."
				)
			},
			{
				heading: "What to do",
				html: paragraphs(
					"Hang up. Do not press buttons or say “yes” if an automated system is listening for a response. If you want to extend coverage, contact your dealer or manufacturer using a number you already have.",
					"Report the call at [[ftcReport]] and with the [[fccComplaints]]. Register your number on [[dnc]] if you have not already — it will not stop every scam robocall, but it is the official U.S. list for reducing sales calls from legitimate telemarketers.",
					'You can also <a href="/report">report the number on NoSpamCalls</a> and see <a href="/block-spam-calls">how to block spam calls</a> on your phone and carrier.'
				)
			}
		],
		related: [
			{ href: "/block-spam-calls", label: "How to block spam calls" },
			{ href: "/scams/political-robocalls", label: "Political robocalls" },
			{ href: "/report-spam-calls", label: "How to report spam calls" },
			{ href: "/scam-likely", label: "What “Scam Likely” means" }
		],
		sources: [
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: FCC_STOP, label: "FCC: Stop unwanted robocalls and texts" },
			{ href: DNC, label: "National Do Not Call Registry" },
			{ href: FCC_COMPLAINTS, label: "FCC consumer complaints" }
		]
	},
	{
		slug: "amazon-apple",
		path: "/scams/amazon-apple",
		section: "scams",
		title: "Fake Apple and Amazon support calls",
		description:
			"The FTC warns that callers sometimes pose as Apple or Amazon support. Hang up, do not give codes or payment details, and contact the company only through its official app or site.",
		headline: "Fake Apple and Amazon support calls",
		answer:
			"If someone calls claiming to be Apple or Amazon support, treat it as a scam until you have verified it yourself. Hang up. Do not share passwords, one-time codes, or payment information. Contact the company only through the official app or a website you type yourself.",
		schema: "Article",
		crumbs: scam("amazon-apple", "Fake Apple and Amazon support"),
		faqs: [
			{
				q: "Will Apple or Amazon call me about a charge or a locked account?",
				a: "Unexpected calls that demand a code, remote access, or immediate payment are a well-known pattern the FTC has warned about. Use the company’s official app or website to review charges and accounts instead of trusting the inbound caller."
			},
			{
				q: "The caller knew my name or a recent order. Is it real?",
				a: "Not necessarily. Callers may use leaked or guessed information, or they may be fishing for you to confirm it. Still hang up and check the official app or site."
			},
			{
				q: "What if I already gave a code or remote access?",
				a: "Stop the conversation, change your passwords, sign out of other sessions if the official account tools allow it, contact the real company through the official app, and report the incident to the FTC. If money moved, call your bank or card issuer."
			}
		],
		sections: [
			{
				heading: "What the FTC has warned about",
				html: paragraphs(
					"[[ftcApple]] describes callers who claim there is a fraudulent charge, a locked iCloud or Amazon account, or a problem with a subscription or Prime membership. They may ask you to read a one-time passcode, buy gift cards, grant remote access, or move money to a “safe” account.",
					"Real account problems should be checked inside the official Apple, iCloud, Amazon, or banking app you already use — or on a site you type yourself — not on a call you did not expect."
				)
			},
			{
				heading: "Warning signs",
				html: list([
					"The caller asks for a one-time code from a text or authenticator app.",
					"You are told to buy gift cards, use cryptocurrency, or transfer funds to protect your money.",
					"You are asked to install remote-access software or to read screens out loud.",
					"You are pressured not to hang up or not to talk to anyone else."
				])
			},
			{
				heading: "What to do",
				html: paragraphs(
					"Hang up. Open the official app or type the official website yourself and review recent charges or security settings there. If a charge is wrong, use the company’s published support process.",
					'Report the incident at [[ftcReport]] and, if it was a robocall, with the [[fccComplaints]]. You can also <a href="/report">report the number here</a>.'
				)
			}
		],
		related: [
			{ href: "/scams/bank-fraud-alert", label: "Fake bank fraud-alert calls and texts" },
			{ href: "/scams/utility-tech-support", label: "Utility and tech-support scams" },
			{ href: "/report-spam-calls", label: "How to report spam calls" }
		],
		sources: [
			{ href: FTC_APPLE, label: "FTC: Fake calls from Apple and Amazon support" },
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: FCC_COMPLAINTS, label: "FCC consumer complaints" }
		]
	},
	{
		slug: "bank-fraud-alert",
		path: "/scams/bank-fraud-alert",
		section: "scams",
		title: "Bank Scam Calls & Fake Fraud-Alert Texts: How to Tell If It’s Real",
		description:
			"Got a call or text from your “bank’s fraud department”? Fake fraud alerts are among the FTC’s top text scams. Never share a one-time code or use the number in the alert. Here’s the safe way to check.",
		headline: "Fake bank and card fraud-alert calls and texts",
		answer:
			"An unexpected “fraud alert” call or text may be a scam even if it looks like your bank. Do not tap the link or call the number in the message. Use the phone number on the back of your card, or open the official banking app you already use, and contact the bank there.",
		schema: "Article",
		crumbs: scam("bank-fraud-alert", "Fake bank fraud alerts"),
		faqs: [
			{
				q: "Do banks really send fraud-alert texts?",
				a: "Yes, many do. That is why the format is copied so often. The safe habit is the same either way: do not use the link or callback number in an unexpected message. Open your official app or dial the number printed on your card."
			},
			{
				q: "Why would a caller ask for a one-time code?",
				a: "One-time passcodes are often the key to your account. A real fraud department that called you will not need you to read a code that just arrived on the same phone to cancel a charge. If someone asks for that code, hang up and contact the bank yourself."
			},
			{
				q: "What does “CBNA” mean in an alert text?",
				a: "CBNA is short for Citibank, N.A., the bank that issues Citi cards and many store cards. Real card alerts exist, but scammers copy bank names too. Do not tap the link or call back the number in the text. Open the official card app, or call the number on the back of your card."
			},
			{
				q: "What should I do if I already tapped a link or gave a code?",
				a: "Call the bank using a number you already trust, report the incident, change your password, and watch the account. Report the contact at ReportFraud.ftc.gov."
			}
		],
		sections: [
			{
				heading: "Why these messages work",
				html: paragraphs(
					"[[ftcTexts]] lists fake fraud alerts among the leading text-scam types reported to the FTC. The message may mention a large purchase, a locked account, or a suspicious login and push you to call or tap immediately.",
					"Callers may also spoof a bank name on caller ID. A familiar name on the screen is not proof the bank is on the line."
				)
			},
			{
				heading: "The safe way to check",
				html: paragraphs(
					"Leave the message. Open your official banking or card app, or dial the number printed on the card or your statement. Ask whether there is a real alert on the account.",
					"Never read a one-time passcode, full PIN, or password to an inbound caller. Never transfer money to a “safe account” at a stranger’s direction.",
					"Report scam texts and calls at [[ftcReport]]. You can forward scam texts to 7726 (SPAM) for your carrier, and file illegal robocall complaints with the [[fccComplaints]]."
				)
			}
		],
		related: [
			{ href: "/scams/amazon-apple", label: "Fake Apple and Amazon support calls" },
			{ href: "/scams/toll-road-text", label: "Fake unpaid-toll texts" },
			{ href: "/scams/wrong-number-text", label: "Wrong-number text scams" },
			{ href: "/report-spam-calls", label: "How to report spam calls" }
		],
		sources: [
			{ href: FTC_TEXTS, label: "FTC Data Spotlight: Top Text Scams of 2024" },
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: FCC_STOP, label: "FCC: Stop unwanted robocalls and texts" }
		]
	}
];
