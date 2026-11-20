export const SITE_NAME = 'NoSpamCalls';

export function siteUrl(): string {
	const explicit = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '');
	if (explicit) return explicit;
	const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
	if (prod) return `https://${prod.replace(/\/$/, '')}`;
	const vercel = process.env.VERCEL_URL;
	if (vercel) return `https://${vercel.replace(/\/$/, '')}`;
	return 'http://localhost:5173';
}

export function absoluteUrl(path: string): string {
	return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
