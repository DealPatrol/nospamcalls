import type { Guide } from "./types";
import { paragraphs } from "./html";
import {
	APPLE_UNKNOWN,
	ATT,
	DNC,
	FCC_BLOCKING,
	FCC_COMPLAINTS,
	FTC_REPORT,
	GOOGLE_SCREEN,
	GOOGLE_SPAM,
	TMO,
	VERIZON
} from "./sources";

const block = (slug: string, label: string) => [
	{ href: "/block-spam-calls", label: "Block spam calls" },
	{ href: `/block-spam-calls/${slug}`, label }
];

export const BLOCK_GUIDES: Guide[] = [
	{
		slug: "iphone",
		path: "/block-spam-calls/iphone",
		section: "block",
		title: "How to silence and block spam calls on iPhone",
		description:
			"Use Silence Unknown Callers and related iPhone tools to send unknown numbers to voicemail, then add carrier filters. Follow Apple’s official steps, which can change with iOS versions.",
		headline: "How to silence and block spam calls on iPhone",
		answer:
			"On iPhone, you can send calls from unknown numbers to voicemail with Apple’s unknown-caller controls, block specific numbers in the Phone app, and report junk in Messages. Pair that with your carrier’s free spam tools. Follow the current Apple Support article, because menu names change with iOS.",
		schema: "HowTo",
		howToName: "How to silence unknown callers on iPhone",
		howToSteps: [
			{
				name: "Open Apple’s official unknown-caller settings",
				text: "On your iPhone, open Settings and go to the Phone settings described in Apple Support article 111106, “Manage unknown callers on iPhone.” Use that article if a menu name on your software version differs from what you remember."
			},
			{
				name: "Turn on screening or silencing for unknown callers",
				text: "Enable the option to silence or screen calls from numbers that are not in your contacts, recent outgoing calls, or Siri suggestions, as described by Apple. Calls from unknown numbers can go to voicemail instead of ringing."
			},
			{
				name: "Block a specific number when needed",
				text: "In a recent call or voicemail, use the info controls to block the number. You can also block senders in Messages."
			},
			{
				name: "Turn on your carrier’s free spam tools",
				text: "Add AT&T ActiveArmor, Verizon Call Filter, T-Mobile Scam Shield, or your carrier’s equivalent, and review our carrier guides."
			}
		],
		crumbs: block("iphone", "iPhone"),
		faqs: [
			{
				q: "Will Silence Unknown Callers stop every scam call?",
				a: "No. Numbers already in your contacts can still ring, and scammers sometimes spoof a number you may have called before. The setting still cuts down a lot of cold calls."
			},
			{
				q: "Can I still see who called?",
				a: "Yes. Silenced or screened calls typically still appear in Recents and may leave a voicemail. Check Apple’s article for how your iOS version presents them."
			},
			{
				q: "What if a school, doctor, or delivery service cannot get through?",
				a: "Add important numbers to Contacts, or temporarily turn the feature off when you are expecting a call from a new number. You can also ask the caller to use a number you already have on file."
			}
		],
		sections: [
			{
				heading: "Use Apple’s official unknown-caller tools",
				html: paragraphs(
					"Apple documents the current steps in [[apple]]. Depending on your iOS version, this may appear as Silence Unknown Callers or as screening and filtering controls for unknown callers. The idea is the same: calls from numbers you do not already know can be sent to voicemail instead of ringing your phone.",
					"Because menu labels change, follow the Apple article on the phone you are holding rather than memorizing an old path."
				)
			},
			{
				heading: "Block individual numbers and junk texts",
				html: paragraphs(
					"In the Phone app, open a recent call, tap the info button, and use Block Caller. In Messages, you can block a sender and report junk when Apple gives you that option. Blocking one spoofed number will not stop the next spoofed number, which is why unknown-caller silencing and carrier tools matter too."
				)
			},
			{
				heading: "Add carrier tools, then report serious scams",
				html: paragraphs(
					'Your carrier can label or block many scam-likely calls on the network. See our guides for <a href="/block-spam-calls/att">AT&amp;T</a>, <a href="/block-spam-calls/verizon">Verizon</a>, and <a href="/block-spam-calls/t-mobile">T-Mobile</a>, or [[fccBlocking]] for a broader list.',
					"Report scams at [[ftcReport]] and illegal robocalls with the [[fccComplaints]]. Register at [[dnc]] to reduce many legitimate telemarketing calls."
				)
			}
		],
		related: [
			{ href: "/block-spam-calls/android", label: "Block spam calls on Android" },
			{ href: "/block-spam-calls/att", label: "AT&T ActiveArmor" },
			{ href: "/block-spam-calls/verizon", label: "Verizon Call Filter" },
			{ href: "/block-spam-calls/t-mobile", label: "T-Mobile Scam Shield" },
			{ href: "/scam-likely", label: "What “Scam Likely” means" }
		],
		sources: [
			{ href: APPLE_UNKNOWN, label: "Apple Support: Manage unknown callers on iPhone" },
			{ href: FCC_BLOCKING, label: "FCC call-blocking tools and resources" },
			{ href: DNC, label: "National Do Not Call Registry" },
			{ href: FTC_REPORT, label: "FTC ReportFraud.ftc.gov" }
		]
	},
	{
		slug: "android",
		path: "/block-spam-calls/android",
		section: "block",
		title: "How to screen and block spam calls on Android",
		description:
			"Use the Google Phone app’s spam protection and Call Screen, then add your carrier’s free tools. Official Google Help steps can vary by phone brand.",
		headline: "How to screen and block spam calls on Android",
		answer:
			"On many Android phones, the Google Phone app can filter spam and offer Call Screen so a suspected caller is greeted by the Google Assistant before your phone rings. Turn those features on, then add your carrier’s free scam-blocking tools. Phone brands differ, so use Google’s official Help pages for the exact taps.",
		schema: "HowTo",
		howToName: "How to turn on spam protection and Call Screen on Android",
		howToSteps: [
			{
				name: "Open the Google Phone app settings",
				text: "Open the Phone app from Google, go to Settings, then the spam or Call Screen section. If your phone uses a different dialer, check that manufacturer’s support pages or install the Google Phone app if it is available for your device."
			},
			{
				name: "Turn on spam filtering",
				text: "Enable spam and fraud protection so suspected spam can be identified or filtered, as described in Google Phone Help."
			},
			{
				name: "Turn on Call Screen if it is offered",
				text: "On supported devices, enable Call Screen so unknown or suspected spam calls can be screened automatically or when you choose."
			},
			{
				name: "Add your carrier’s tools",
				text: "Turn on AT&T ActiveArmor, Verizon Call Filter, T-Mobile Scam Shield, or your carrier’s equivalent."
			}
		],
		crumbs: block("android", "Android"),
		faqs: [
			{
				q: "Does every Android phone have Call Screen?",
				a: "No. Call Screen is offered on supported devices through the Google Phone app and can vary by country and model. Spam protection may still be available when Call Screen is not."
			},
			{
				q: "Will this block my doctor or a delivery driver?",
				a: "It can screen or filter numbers that are not in your contacts. Add important numbers to contacts, and review screened calls in the Phone app so you can call back when a real person needed to reach you."
			},
			{
				q: "What if my phone uses Samsung or another dialer?",
				a: "Many brands have their own spam-filter or smart-call settings. You can use those, install the Google Phone app if it is available, and still enable your carrier’s network tools."
			}
		],
		sections: [
			{
				heading: "Use official Google Phone tools",
				html: paragraphs(
					"Google documents [[googleSpam]] and [[googleScreen]]. On supported phones, you can automatically filter suspected spam and let Call Screen handle unknown or suspicious callers. Exact menu names depend on the Phone app version and the device.",
					"You can also block a number from a recent call in the Phone app. Blocking one spoofed number will not stop the next one, so filtering plus carrier tools work better together."
				)
			},
			{
				heading: "Add your carrier, then report scams",
				html: paragraphs(
					'See <a href="/block-spam-calls/att">AT&amp;T</a>, <a href="/block-spam-calls/verizon">Verizon</a>, or <a href="/block-spam-calls/t-mobile">T-Mobile</a>, and [[fccBlocking]] for additional options.',
					"Report scams at [[ftcReport]] and illegal robocalls with the [[fccComplaints]]. Register at [[dnc]] for the official U.S. Do Not Call list."
				)
			}
		],
		related: [
			{ href: "/block-spam-calls/iphone", label: "Block spam calls on iPhone" },
			{ href: "/block-spam-calls/att", label: "AT&T ActiveArmor" },
			{ href: "/block-spam-calls/verizon", label: "Verizon Call Filter" },
			{ href: "/block-spam-calls/t-mobile", label: "T-Mobile Scam Shield" }
		],
		sources: [
			{ href: GOOGLE_SPAM, label: "Google Phone Help: spam and Call Screen" },
			{ href: GOOGLE_SCREEN, label: "Google Phone Help: Call Screen" },
			{ href: FCC_BLOCKING, label: "FCC call-blocking tools and resources" },
			{ href: DNC, label: "National Do Not Call Registry" }
		]
	},
	{
		slug: "att",
		path: "/block-spam-calls/att",
		section: "block",
		title: "How to block spam calls on AT&T (ActiveArmor)",
		description:
			"AT&T ActiveArmor can identify and help block spam and fraud calls on AT&T wireless lines. Here is how to use the official AT&T support steps and what the app cannot promise.",
		headline: "How to block spam calls on AT&T with ActiveArmor",
		answer:
			"AT&T wireless customers can use the free ActiveArmor features to help identify and block many spam or fraud calls and texts. Install or open the official AT&T ActiveArmor app, enable the call and text protections you want, and still use your phone’s unknown-caller tools. No carrier filter catches everything.",
		schema: "HowTo",
		howToName: "How to turn on AT&T ActiveArmor call protections",
		howToSteps: [
			{
				name: "Get the official AT&T ActiveArmor app",
				text: "Use AT&T’s official support article to download or update ActiveArmor from a trusted app store. Sign in with your AT&T account."
			},
			{
				name: "Turn on call and text protections",
				text: "In the app, open the calls and texts or similar controls and enable spam and fraud blocking or alerts as AT&T describes in its support article."
			},
			{
				name: "Review blocked or flagged calls",
				text: "Check the app’s call list so you can release a number that should have been allowed, such as a school or doctor’s office."
			},
			{
				name: "Add device-level controls",
				text: "On iPhone, also use Apple’s unknown-caller settings. On Android, use spam protection or Call Screen when available."
			}
		],
		crumbs: block("att", "AT&T"),
		faqs: [
			{
				q: "Is AT&T ActiveArmor free?",
				a: "AT&T documents ActiveArmor as a security app for its wireless customers, with call and text protections described in official support articles. Some related AT&T security features may depend on your plan. Check AT&T’s article and your line’s settings for what is included."
			},
			{
				q: "Will ActiveArmor stop every robocall?",
				a: "No. Callers change numbers and spoof caller ID. Use the app together with iPhone or Android unknown-caller tools, and report scams to the FTC and FCC."
			},
			{
				q: "What if a real caller is blocked?",
				a: "Check the ActiveArmor call or block list and allow the number, and add it to your contacts. You can also temporarily relax a filter if you are expecting a callback from a new number."
			}
		],
		sections: [
			{
				heading: "Use AT&T’s official ActiveArmor steps",
				html: paragraphs(
					"AT&T explains how to install, update, and use the app in [[att]]. Look there for the current menus. In general, you sign in, enable protections for calls and texts, and review flagged numbers so a real caller is not left in a block list by mistake.",
					"ActiveArmor is an AT&T wireless tool. Landline options differ; ask AT&T or see [[fccBlocking]] for other resources."
				)
			},
			{
				heading: "Combine it with your phone and official reporting",
				html: paragraphs(
					'Also see <a href="/block-spam-calls/iphone">iPhone</a> or <a href="/block-spam-calls/android">Android</a> settings. Register at [[dnc]]. Report scams at [[ftcReport]] and illegal robocalls with the [[fccComplaints]].'
				)
			}
		],
		related: [
			{ href: "/block-spam-calls/verizon", label: "Verizon Call Filter" },
			{ href: "/block-spam-calls/t-mobile", label: "T-Mobile Scam Shield" },
			{ href: "/block-spam-calls/iphone", label: "iPhone guide" },
			{ href: "/block-spam-calls/android", label: "Android guide" },
			{ href: "/scam-likely", label: "What “Scam Likely” means" }
		],
		sources: [
			{ href: ATT, label: "AT&T: Use the AT&T ActiveArmor app" },
			{ href: FCC_BLOCKING, label: "FCC call-blocking tools and resources" },
			{ href: DNC, label: "National Do Not Call Registry" }
		]
	},
	{
		slug: "verizon",
		path: "/block-spam-calls/verizon",
		section: "block",
		title: "How to block spam calls on Verizon (Call Filter)",
		description:
			"Verizon Call Filter can identify and help block spam and robocalls on Verizon wireless lines. Use Verizon’s official instructions and pair them with iPhone or Android settings.",
		headline: "How to block spam calls on Verizon with Call Filter",
		answer:
			"Verizon wireless customers can use Call Filter (often through Verizon’s official app or Protect tools) to flag and block many suspected spam calls. Turn it on in Verizon’s official settings for your line, then add your iPhone or Android unknown-caller controls. No filter catches every spoofed call.",
		schema: "HowTo",
		howToName: "How to turn on Verizon Call Filter",
		howToSteps: [
			{
				name: "Open Verizon’s official Call Filter instructions",
				text: "Use Verizon’s Call Filter page or in-app Verizon Protect / call-blocking settings for your wireless line. Features can vary by plan."
			},
			{
				name: "Enable spam identification and blocking",
				text: "Turn on caller identification and the block settings you want, following Verizon’s current menus."
			},
			{
				name: "Review flagged calls",
				text: "Check the call or filter list if you think a real caller was blocked, and add important numbers to contacts."
			},
			{
				name: "Add device-level controls",
				text: "Use iPhone unknown-caller settings or Android spam protection and Call Screen as well."
			}
		],
		crumbs: block("verizon", "Verizon"),
		faqs: [
			{
				q: "Is Verizon Call Filter free?",
				a: "Verizon offers Call Filter tools for wireless customers; some features or higher-tier options may depend on your plan. Check Verizon’s official Call Filter page and your account for what is included on your line."
			},
			{
				q: "Does Call Filter work on a Verizon landline or home phone?",
				a: "The consumer Call Filter product described here is a wireless feature. Ask Verizon about unwanted-call tools for home phone service, and see the FCC’s call-blocking resources."
			},
			{
				q: "Why do I still get spam after turning it on?",
				a: "Caller ID spoofing and new numbers get through every network filter sometimes. Keep device-level unknown-caller tools on, and report scams to the FTC and FCC."
			}
		],
		sections: [
			{
				heading: "Turn on Verizon’s official filter",
				html: paragraphs(
					"Verizon describes the product at [[verizon]]. Follow that page or the Verizon app for the exact taps on your phone, including any Verizon Protect or call-blocking-and-identification settings.",
					"Once it is on, your phone may show labels on suspected spam calls and can block some of them automatically, depending on the options you choose and the plan you have."
				)
			},
			{
				heading: "Add phone settings and official reporting",
				html: paragraphs(
					'Use the <a href="/block-spam-calls/iphone">iPhone</a> or <a href="/block-spam-calls/android">Android</a> guide as well. Register at [[dnc]]. Report scams at [[ftcReport]] and illegal robocalls with the [[fccComplaints]].'
				)
			}
		],
		related: [
			{ href: "/block-spam-calls/att", label: "AT&T ActiveArmor" },
			{ href: "/block-spam-calls/t-mobile", label: "T-Mobile Scam Shield" },
			{ href: "/block-spam-calls/iphone", label: "iPhone guide" },
			{ href: "/scam-likely", label: "What “Scam Likely” means" }
		],
		sources: [
			{ href: VERIZON, label: "Verizon Call Filter" },
			{ href: FCC_BLOCKING, label: "FCC call-blocking tools and resources" },
			{ href: DNC, label: "National Do Not Call Registry" }
		]
	},
	{
		slug: "t-mobile",
		path: "/block-spam-calls/t-mobile",
		section: "block",
		title: "How to block spam calls on T-Mobile (Scam Shield)",
		description:
			"T-Mobile Scam Shield can identify and block many scam calls. Use official T-Mobile steps, including Scam Block and the T-Life app, and pair them with iPhone or Android settings.",
		headline: "How to block spam calls on T-Mobile with Scam Shield",
		answer:
			"T-Mobile wireless customers can use Scam Shield, including Scam ID and Scam Block, to flag and automatically block many suspected scam calls. Manage it in the official T-Life or Scam Shield tools T-Mobile documents, and still use your phone’s unknown-caller settings.",
		schema: "HowTo",
		howToName: "How to turn on T-Mobile Scam Shield",
		howToSteps: [
			{
				name: "Read T-Mobile’s official Scam Shield page",
				text: "Open T-Mobile’s Scam Shield support article for the current way to manage Scam ID, Scam Block, and related features on your line."
			},
			{
				name: "Turn on Scam Block",
				text: "Enable Scam Block so many calls T-Mobile identifies as scams are blocked before your phone rings, following T-Mobile’s instructions. Some plans include this automatically."
			},
			{
				name: "Review the T-Life or Scam Shield controls",
				text: "Use T-Mobile’s official app controls to adjust settings and check whether a blocked caller should be allowed."
			},
			{
				name: "Add device-level controls",
				text: "Use iPhone unknown-caller settings or Android spam protection and Call Screen too."
			}
		],
		crumbs: block("t-mobile", "T-Mobile"),
		faqs: [
			{
				q: "What is the difference between Scam ID and Scam Block?",
				a: "T-Mobile describes Scam ID as a way to label suspected scam calls, and Scam Block as a way to block many of those calls automatically. See T-Mobile’s Scam Shield article for the current definitions and how to change them on your line."
			},
			{
				q: "Can I dial a code to control Scam Block?",
				a: "T-Mobile has published short-code or dialer-code controls for Scam Shield features, including codes people associate with turning Scam Block on or off. Those codes can change, so confirm the current code on T-Mobile’s official Scam Shield page before you use one."
			},
			{
				q: "I still get scam calls on T-Mobile. What else can I do?",
				a: "Turn on iPhone or Android unknown-caller tools, report scams to the FTC and FCC, and register on the National Do Not Call list. No network filter is complete when callers spoof new numbers."
			}
		],
		sections: [
			{
				heading: "Use official T-Mobile Scam Shield controls",
				html: paragraphs(
					"T-Mobile documents the feature set at [[tmo]]. That page is the right place to confirm how to enable Scam ID, Scam Block, and any related tools in the T-Life app, and to confirm any dialer codes that still work on your line.",
					"Some T-Mobile plans include scam blocking by default. You should still look at the actual setting on your account so a change or a new line has not left it off."
				)
			},
			{
				heading: "Add phone settings and official reporting",
				html: paragraphs(
					'Pair Scam Shield with the <a href="/block-spam-calls/iphone">iPhone</a> or <a href="/block-spam-calls/android">Android</a> guide. Register at [[dnc]]. Report scams at [[ftcReport]] and illegal robocalls with the [[fccComplaints]].'
				)
			}
		],
		related: [
			{ href: "/block-spam-calls/att", label: "AT&T ActiveArmor" },
			{ href: "/block-spam-calls/verizon", label: "Verizon Call Filter" },
			{ href: "/block-spam-calls/iphone", label: "iPhone guide" },
			{ href: "/scam-likely", label: "What “Scam Likely” means" }
		],
		sources: [
			{ href: TMO, label: "T-Mobile: Scam Shield" },
			{ href: FCC_BLOCKING, label: "FCC call-blocking tools and resources" },
			{ href: DNC, label: "National Do Not Call Registry" }
		]
	}
];
