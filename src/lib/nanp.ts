/** Returns the 11-digit integer for a valid US/NANP number, or null. */
export function toNanpInt(e164: string): number | null {
	const digits = e164.replace(/\D/g, '');
	const ten = digits.length === 11 && digits[0] === '1' ? digits.slice(1) : digits.length === 10 ? digits : null;
	if (!ten) return null;
	// NPA and NXX cannot start with 0 or 1; N11 service codes are not subscriber numbers.
	if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(ten)) return null;
	if (ten[1] === '1' && ten[2] === '1') return null;
	if (ten[4] === '1' && ten[5] === '1') return null;
	return Number('1' + ten);
}
