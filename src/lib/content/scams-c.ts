import type { Guide } from "./types";
import { paragraphs } from "./html";
import { FCC_COMPLAINTS, FCC_ONE_RING, FCC_STOP, FTC_REPORT, FTC_TEXTS, USA_GOV } from "./sources";

const scam = (slug: string, label: string) => [
	{ href: "/scams", label: "Scam call guides" },
	{ href: `/scams/${slug}`, label }
];

export const SCAMS_C: Guide[] = [
	{
		slug: "toll-road-text",
		path: "/scams/toll-road-text",
		section: "scams",
		title: "Fake unpaid toll road text scams",
		description:
			"Bogus unpaid-toll texts were one of the FTC’s top text scams of 2024, often impersonating E-ZPass, SunPass, FasTrak, and similar programs. Do not tap the link.",
		headline: "Fake unpaid-toll texts (E-ZPass, SunPass, FasTrak, and others)",
		answer:
			"A text about an unpaid toll or a suspended transponder is a common scam. Do not tap the link or pay from the message. Look up the official toll or transportation site yourself, or use the app you already have, and report the text to the FTC and to 7726.",
		schema: "Article",
		crumbs: scam("toll-road-text", "Fake unpaid-toll texts"),
		faqs: [
			{
				q: "How can I tell if a toll text is real?",
				a: "Do not rely on the link or the sender name. Open a bookmark, type the official agency address yourself, or use the official app on your phone and check your account there. If you do not have a transponder or did not drive a toll road, treat the text as a scam."
			},
			{
				q: "What programs do these texts impersonate?",
				a: "The FTC has described unpaid-toll texts that impersonate programs such as SunPass and FasTrak. Complaints have also involved other brands, including E-ZPass. The program name in the text is not proof it is official."
			},
			{
				q: "Where do I report a fake toll text?",
				a: "Forward the text to 7726 (SPAM) and report it at ReportFraud.ftc.gov. If a call is involved, you can also file an FCC complaint."
			}
		],
		sections: [
			{
				heading: "What the FTC has documented",
				html: paragraphs(
					"[[ftcTexts]] identified bogus unpaid-toll notices as one of the major text-scam categories reported in 2024. The messages typically claim you have an unpaid balance or a suspended pass and then send you to a look-alike site to enter card data or other personal information.",
					"The text may use a well-known program name. That name can be copied. Pay only through an official site or app you navigate to yourself."
				)
			},
			{
				heading: "What to do",
				html: paragraphs(
					"Do not tap the link. Do not call a number in the text unless you have confirmed it independently. If you use a toll transponder or account, open the official app or type the official website and review your balance there.",
					'Forward the text to 7726 and report it at [[ftcReport]]. If you already entered a card number, call the card issuer. You can also <a href="/report">report a related phone number here</a>.'
				)
			}
		],
		related: [
			{ href: "/scams/bank-fraud-alert", label: "Fake bank fraud-alert texts" },
			{ href: "/scams/wrong-number-text", label: "Wrong-number text scams" },
			{ href: "/report-spam-calls", label: "How to report spam calls" }
		],
		sources: [
			{ href: FTC_TEXTS, label: "FTC Data Spotlight: Top Text Scams of 2024" },
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: FCC_STOP, label: "FCC: Stop unwanted robocalls and texts" }
		]
	},
	{
		slug: "wrong-number-text",
		path: "/scams/wrong-number-text",
		section: "scams",
		title: "Wrong-number text scams",
		description:
			"A friendly “sorry, wrong number” text is often the start of a conversation scam. Do not keep chatting, do not click links, and report the message to the FTC and 7726.",
		headline: "Wrong-number texts: why a polite mistake can be a scam",
		answer:
			"A sudden text that apologizes for messaging the “wrong number,” then tries to keep the conversation going, is a common scam opener. Do not keep chatting, do not click links, and do not move the talk to another app. Forward the text to 7726 and report it to the FTC.",
		schema: "Article",
		crumbs: scam("wrong-number-text", "Wrong-number texts"),
		faqs: [
			{
				q: "What is the goal of a wrong-number text?",
				a: "Often the sender wants to build a relationship and later pitch a fake investment, cryptocurrency opportunity, or romance story. Other times the text is a lure to a phishing site. Either way, you do not need to reply."
			},
			{
				q: "Is it rude to ignore it?",
				a: "No. A legitimate mistaken text does not need a back-and-forth. If you reply, you confirm that your number is active."
			},
			{
				q: "How do I report it?",
				a: "Forward the text to 7726 (SPAM) and report it at ReportFraud.ftc.gov. You can also block the sender in your phone’s messages app."
			}
		],
		sections: [
			{
				heading: "How the conversation is supposed to start",
				html: paragraphs(
					"The first message may be short and friendly: a name, a photo, or “Sorry, I think I have the wrong number.” If you reply, the sender often becomes warm, curious, and eventually suggests a better chat app — then an investment, a mentor, or a website that is not a registered, well-known brokerage.",
					"The FTC and other consumer agencies have warned people about these long-con investment and romance pitches. You do not have to test the sender. You can stop at the first message."
				)
			},
			{
				heading: "What to do",
				html: paragraphs(
					"Do not reply. Do not tap links or scan QR codes. Block the sender. Forward the text to 7726 and report it at [[ftcReport]].",
					"If you already sent money or shared financial details, contact your bank or the service you used, and include that information in your FTC report. For investment pitches, the SEC and your state securities regulator are additional official contacts, listed through the FTC and USA.gov complaint pages such as [[usaGov]]."
				)
			}
		],
		related: [
			{ href: "/scams/bank-fraud-alert", label: "Fake bank fraud-alert texts" },
			{ href: "/scams/toll-road-text", label: "Fake unpaid-toll texts" },
			{ href: "/report-spam-calls", label: "How to report spam calls" }
		],
		sources: [
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" },
			{ href: FTC_TEXTS, label: "FTC Data Spotlight: Top Text Scams of 2024" },
			{ href: USA_GOV, label: "USA.gov: Complain about phone and text scams" }
		]
	},
	{
		slug: "one-ring-wangiri",
		path: "/scams/one-ring-wangiri",
		section: "scams",
		title: "One-ring and Wangiri phone scams",
		description:
			"The FCC warns that one-ring calls can be a trap so you call back an international or premium-rate number. Do not call back. Watch for numbers that only look like U.S. area codes.",
		headline: "One-ring (Wangiri) scams: do not call back",
		answer:
			"If a call rings once and hangs up, do not call the number back. The FCC warns that this “one-ring” or Wangiri scam can connect you to an expensive international or premium-rate line. Let it go, and check your bill if you already returned the call.",
		schema: "Article",
		crumbs: scam("one-ring-wangiri", "One-ring / Wangiri scams"),
		faqs: [
			{
				q: "What is a Wangiri or one-ring scam?",
				a: "Wangiri is a Japanese term often translated as “one and cut.” The caller lets your phone ring once so you will call back, then you may be billed at high international or premium rates."
			},
			{
				q: "Which country codes should I be careful about?",
				a: "The FCC has highlighted that one-ring callbacks can go to international numbers, and it has specifically mentioned examples such as country code 809 (Dominican Republic) and 232 (Sierra Leone). A number that looks like a U.S. area code may actually be an international code. Do not call back to find out."
			},
			{
				q: "What if I already called back?",
				a: "Stop placing further calls to that number. Contact your phone company, ask about international or premium-rate charges, and report the incident to the FCC. The FCC’s one-ring guide has more detail."
			}
		],
		sections: [
			{
				heading: "What the FCC says about one-ring calls",
				html: paragraphs(
					"[[fccOneRing]] explains the scheme: your phone rings once, the caller hangs up, and you are tempted to call back a missed number. The return call can be routed to an overseas or premium-rate number with very high per-minute rates.",
					'The FCC has noted that some international codes, including 809 and 232 in its examples, can be mistaken for U.S. area codes. If you do not recognize a missed call, do not return it. You can look the number up instead and <a href="/report">report it</a> if it appears to be a scam.'
				)
			},
			{
				heading: "What to do",
				html: paragraphs(
					"Do not call back. Do not press keys if you already connected and an automated system instructs you to do so — hang up. Ask your carrier whether you can block international or premium-rate calls if you do not need them.",
					"Report the issue to the [[fccComplaints]] and review [[fccOneRing]]. If a charge already appears, contact your carrier promptly and ask about a billing review."
				)
			}
		],
		related: [
			{ href: "/area-code", label: "U.S. area-code directory" },
			{ href: "/report-spam-calls", label: "How to report spam calls" },
			{ href: "/block-spam-calls", label: "How to block spam calls" },
			{ href: "/scam-likely", label: "What “Scam Likely” means" }
		],
		sources: [
			{ href: FCC_ONE_RING, label: "FCC: One-Ring Phone Scam" },
			{ href: FCC_COMPLAINTS, label: "FCC consumer complaints" },
			{ href: FCC_STOP, label: "FCC: Stop unwanted robocalls and texts" }
		]
	}
];
