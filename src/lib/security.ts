import { createHash } from 'node:crypto';

const URL_RE = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|info|xyz|biz|co|io|us)\b/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROFANITY_RE =
	/\b(fuck|shit|bitch|asshole|cunt|nigger|nigga|faggot|retard|whore|slut|bastard)\b/i;

import { COMMENT_MAX, NAME_MAX } from './limits';

export { COMMENT_MAX } from './limits';

export function hashIp(ip: string): string {
	const salt = process.env.IP_HASH_SECRET;
	if (!salt) throw new Error('IP_HASH_SECRET is not set');
	return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export function isHoneypotFilled(value: FormDataEntryValue | null): boolean {
	return typeof value === 'string' && value.trim().length > 0;
}

export function sanitizeComment(raw: string): { ok: true; comment: string | null } | { ok: false; error: string } {
	const comment = raw.trim().replace(/\s+/g, ' ');
	if (!comment) return { ok: true, comment: null };
	if (comment.length > COMMENT_MAX) {
		return { ok: false, error: `Comments must be ${COMMENT_MAX} characters or fewer.` };
	}
	if (URL_RE.test(comment)) {
		return { ok: false, error: 'Comments cannot include website addresses or links.' };
	}
	if (PROFANITY_RE.test(comment)) {
		return { ok: false, error: 'Please keep comments civil and free of profanity.' };
	}
	return { ok: true, comment };
}

export function normalizeEmail(raw: string): string | null {
	const email = raw.trim().toLowerCase();
	if (!email || email.length > 254 || !EMAIL_RE.test(email)) return null;
	return email;
}

export function hourWindow(now = new Date()): Date {
	const d = new Date(now);
	d.setUTCMinutes(0, 0, 0);
	return d;
}

export function sanitizeName(raw: string): { ok: true; name: string } | { ok: false; error: string } {
	const name = raw.trim().replace(/\s+/g, ' ');
	if (!name) return { ok: false, error: 'Enter a business or organization name.' };
	if (name.length > NAME_MAX) {
		return { ok: false, error: `Names must be ${NAME_MAX} characters or fewer.` };
	}
	if (URL_RE.test(name)) {
		return { ok: false, error: 'Names cannot include website addresses or links.' };
	}
	if (PROFANITY_RE.test(name)) {
		return { ok: false, error: 'Please keep names civil and free of profanity.' };
	}
	return { ok: true, name };
}
