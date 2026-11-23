export type QuizQuestion = {
	id: string;
	prompt: string;
	help?: string;
	good: 'yes' | 'no';
	yesPlan: { title: string; body: string; href?: string; label?: string };
	noPlan: { title: string; body: string; href?: string; label?: string };
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
	{
		id: 'device',
		prompt: 'Have you turned on Silence Unknown Callers (iPhone) or spam protection / Call Screen (Android)?',
		good: 'yes',
		yesPlan: {
			title: 'Keep your phone’s unknown-caller tools on',
			body: 'You already use a built-in filter. Recheck after a software update, and add important numbers (school, doctor, pharmacy) to Contacts so they still ring.',
			href: '/block-spam-calls',
			label: 'Phone and carrier block guides'
		},
		noPlan: {
			title: 'Turn on your phone’s free unknown-caller tools',
			body: 'This is usually the highest-impact free step. iPhone can send unknown numbers to voicemail; many Android phones can filter spam or use Call Screen.',
			href: '/block-spam-calls',
			label: 'Set this up on iPhone or Android'
		}
	},
	{
		id: 'carrier',
		prompt: 'Have you enabled your carrier’s free spam tools (AT&T ActiveArmor, Verizon Call Filter, T-Mobile Scam Shield, or the equivalent)?',
		good: 'yes',
		yesPlan: {
			title: 'Review your carrier filter occasionally',
			body: 'Open the carrier app and make sure a real caller (a clinic, school, or delivery service) was not blocked by mistake.',
			href: '/block-spam-calls',
			label: 'AT&T, Verizon, and T-Mobile guides'
		},
		noPlan: {
			title: 'Turn on your carrier’s free spam tools',
			body: 'AT&T, Verizon, T-Mobile, and many smaller carriers can label or block a lot of suspected scam calls on the network. This works together with your phone settings.',
			href: '/block-spam-calls',
			label: 'See the official carrier steps'
		}
	},
	{
		id: 'dnc',
		prompt: 'Is this phone registered on the National Do Not Call list?',
		good: 'yes',
		yesPlan: {
			title: 'Stay on the Do Not Call list',
			body: 'Registration does not expire. It will not stop most scammers, but it is still the official way to reduce many legitimate sales calls.',
			href: '/stop-spam-calls',
			label: 'Do Not Call guide'
		},
		noPlan: {
			title: 'Register this phone on the National Do Not Call list',
			body: 'It is free. Register the phone that actually receives the calls, at DoNotCall.gov or by calling 1-888-382-1222 from that phone. It will not stop most scam robocalls, but it is still worth doing.',
			href: '/stop-spam-calls',
			label: 'How to register'
		}
	},
	{
		id: 'unknown',
		prompt: 'Do you usually answer calls from numbers you do not recognize?',
		good: 'no',
		yesPlan: {
			title: 'Let unexpected unknown calls go to voicemail',
			body: 'Answering tells some robocall systems that the line is active. If the call matters, a real person will usually leave a message, and you can call back on a number you look up yourself.',
			href: '/scam-likely',
			label: 'What “Scam Likely” means'
		},
		noPlan: {
			title: 'Keep letting unknown numbers go to voicemail',
			body: 'That habit already reduces pressure and callbacks. If you were expecting a call from a new number, add it to Contacts or check voicemail.',
			href: '/scam-likely',
			label: 'What “Scam Likely” means'
		}
	},
	{
		id: 'report',
		prompt: 'Have you reported a recent scam call or text to the FTC or FCC?',
		good: 'yes',
		yesPlan: {
			title: 'Keep reporting serious scams',
			body: 'Official reports help agencies and carriers see patterns. You can also log the number on NoSpamCalls so other people can look it up.',
			href: '/report-spam-calls',
			label: 'How to report spam calls'
		},
		noPlan: {
			title: 'Report scam calls and texts through official channels',
			body: 'Use ReportFraud.ftc.gov for scams, fcc.gov/complaints for illegal robocalls, and 7726 for scam texts. A NoSpamCalls report does not replace those filings.',
			href: '/report-spam-calls',
			label: 'FTC, FCC, and 7726 steps'
		}
	},
	{
		id: 'links',
		prompt: 'Do you tap links or call back numbers from unexpected “fraud alert,” “unpaid toll,” or “package delivery” texts?',
		good: 'no',
		yesPlan: {
			title: 'Stop using the link or number inside unexpected texts',
			body: 'Open the official app or type a site you already trust. Fake bank alerts and unpaid-toll texts are among the FTC’s top text-scam types.',
			href: '/scams/bank-fraud-alert',
			label: 'Fraud-alert and toll-text guides'
		},
		noPlan: {
			title: 'Keep ignoring unexpected payment and “alert” links',
			body: 'That is the right habit. If you want to double-check a message, use an official app or a number printed on a card or bill.',
			href: '/scams',
			label: 'Common phone and text scams'
		}
	}
];

export type QuizAnswers = Record<string, 'yes' | 'no'>;

export function scoreQuiz(answers: QuizAnswers): number {
	let score = 0;
	for (const question of QUIZ_QUESTIONS) {
		if (answers[question.id] === question.good) score += 1;
	}
	return score;
}

export function quizLabel(score: number): string {
	if (score >= 5) return 'Strong basics';
	if (score >= 3) return 'A solid start, with gaps';
	return 'Several free wins still open';
}

export function parseQuizAnswers(data: FormData): QuizAnswers | null {
	const answers: QuizAnswers = {};
	for (const question of QUIZ_QUESTIONS) {
		const value = String(data.get(question.id) ?? '');
		if (value !== 'yes' && value !== 'no') return null;
		answers[question.id] = value;
	}
	return answers;
}
