/** Browser-side helpers for the no-signup workspace key used by the free tools. */
const KEY = 'nsc_account_key';

export function getAccountKey(): string {
	if (typeof localStorage === 'undefined') return '';
	let key = localStorage.getItem(KEY) ?? '';
	if (!/^[a-f0-9]{32}$/.test(key)) {
		const bytes = new Uint8Array(16);
		crypto.getRandomValues(bytes);
		key = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
		localStorage.setItem(KEY, key);
	}
	return key;
}

export function setAccountKey(key: string): void {
	if (typeof localStorage === 'undefined') return;
	if (/^[a-f0-9]{32}$/.test(key)) localStorage.setItem(KEY, key);
}

export async function postJson<T = Record<string, unknown>>(url: string, body: unknown, method = 'POST'): Promise<T> {
	const res = await fetch(url, {
		method,
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});
	const data = (await res.json().catch(() => ({}))) as T & { error?: string };
	if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
	return data;
}
