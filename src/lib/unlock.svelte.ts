/**
 * One email unlocks every free download and printable on the site.
 * The flag lives in localStorage and a first-party cookie (`nsc_unlocked=1`); the email is kept
 * only in this browser (`nsc_email`) so later alert sign-ups can be one click.
 */
const FLAG = 'nsc_unlocked';
const EMAIL = 'nsc_email';

export const unlock = $state({ ready: false, unlocked: false, email: '' });

export function initUnlock(): void {
	if (typeof window === 'undefined' || unlock.ready) return;
	try {
		const cookie = document.cookie.split('; ').some((c) => c === `${FLAG}=1`);
		unlock.unlocked = localStorage.getItem(FLAG) === '1' || cookie;
		unlock.email = localStorage.getItem(EMAIL) ?? '';
	} catch {
		unlock.unlocked = false;
	}
	unlock.ready = true;
}

export function markUnlocked(email: string): void {
	unlock.unlocked = true;
	unlock.email = email;
	try {
		localStorage.setItem(FLAG, '1');
		localStorage.setItem(EMAIL, email);
		document.cookie = `${FLAG}=1; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
	} catch {
		/* private mode: state still unlocked for this page view */
	}
}

export type LeadInput = {
	email: string;
	leadMagnet: string;
	contextValue?: string | null;
	proInterests?: string[];
	website?: string;
};

export async function submitLead(input: LeadInput): Promise<{ ok: boolean; already?: boolean }> {
	const res = await fetch('/api/leads', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ ...input, sourcePath: location.pathname })
	});
	const data = (await res.json().catch(() => ({}))) as { ok?: boolean; already?: boolean; error?: string };
	if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
	markUnlocked(input.email.trim().toLowerCase());
	return { ok: true, already: data.already };
}
