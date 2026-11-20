import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function normalizeToE164(input: string, defaultCountry: 'US' = 'US'): string | null {
	const raw = input.trim();
	if (!raw) return null;
	const parsed = parsePhoneNumberFromString(raw, defaultCountry);
	if (!parsed || !parsed.isValid()) return null;
	return parsed.number;
}

export function slugToE164(slug: string): string | null {
	const trimmed = decodeURIComponent(slug).trim();
	const withPlus = trimmed.startsWith('+') ? trimmed : `+${trimmed.replace(/\D/g, '')}`;
	return normalizeToE164(withPlus) ?? normalizeToE164(trimmed);
}

export function e164ToSlug(e164: string): string {
	return e164.replace(/^\+/, '');
}

export function formatNational(e164: string): string {
	const parsed = parsePhoneNumberFromString(e164);
	return parsed ? parsed.formatNational() : e164;
}

export function formatInternational(e164: string): string {
	const parsed = parsePhoneNumberFromString(e164);
	return parsed ? parsed.formatInternational() : e164;
}
