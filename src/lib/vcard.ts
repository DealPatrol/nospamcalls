/** Builds a vCard 3.0 file with one contact holding every blocked number (CRLF line endings). */
export function buildBlocklistVcard(numbers: string[], updated = new Date()): string {
	const unique = [...new Set(numbers.filter((n) => /^\+\d{8,15}$/.test(n)))];
	const lines = [
		'BEGIN:VCARD',
		'VERSION:3.0',
		'N:Blocklist;NoSpamCalls;;;',
		'FN:NoSpamCalls Blocklist',
		'ORG:NoSpamCalls',
		...unique.map((n) => `TEL;TYPE=CELL:${n}`),
		`NOTE:Block this contact to block every number on it. ${unique.length} numbers. Updated ${updated.toISOString().slice(0, 10)} from nospamcalls.org.`,
		`REV:${updated.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
		'END:VCARD'
	];
	return lines.join('\r\n') + '\r\n';
}
