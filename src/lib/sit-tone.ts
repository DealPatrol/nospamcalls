/**
 * North American Special Information Tone (SIT) generator.
 * Frequencies and segment lengths follow ATIS-0300209 (Network Tones and Announcements) §5 and Bellcore BR 780-200-020:
 * low/high first segment 913.8 / 985.2 Hz, second 1370.6 / 1428.5 Hz, third 1776.7 Hz; short 274 ms, long 380 ms;
 * silent gap between segments no greater than 4 ms. Pure TypeScript, no dependencies — runs in the browser and on the server.
 */
export type SitCode = 'IC' | 'VC' | 'RO' | 'NC';

export const SIT_CODES: Record<SitCode, { label: string; meaning: string; segments: [number, number][] }> = {
	IC: {
		label: 'Intercept (IC)',
		meaning: 'Number changed or disconnected — the classic “not in service” tones.',
		segments: [
			[913.8, 274],
			[1370.6, 274],
			[1776.7, 380]
		]
	},
	VC: {
		label: 'Vacant code (VC)',
		meaning: 'Number not assigned.',
		segments: [
			[985.2, 380],
			[1370.6, 274],
			[1776.7, 380]
		]
	},
	RO: {
		label: 'Reorder (RO)',
		meaning: 'System busy — the call could not be completed.',
		segments: [
			[913.8, 274],
			[1428.5, 380],
			[1776.7, 380]
		]
	},
	NC: {
		label: 'No circuit (NC)',
		meaning: 'No circuit found — all circuits busy.',
		segments: [
			[985.2, 380],
			[1428.5, 380],
			[1776.7, 380]
		]
	}
};

export const SIT_SAMPLE_RATE = 16000;

export function isSitCode(value: unknown): value is SitCode {
	return typeof value === 'string' && value in SIT_CODES;
}

/**
 * Builds a 16-bit PCM mono WAV: the three SIT segments, repeated `repeats` times with `gapMs` of silence between
 * repeats, followed by `tailMs` of silence (room to record your own words after the tones).
 */
export function buildSitWav(code: SitCode = 'IC', opts: { repeats?: number; gapMs?: number; tailMs?: number; leadMs?: number } = {}): Uint8Array<ArrayBuffer> {
	const repeats = Math.min(Math.max(Math.round(opts.repeats ?? 1), 1), 5);
	const gapMs = Math.min(Math.max(opts.gapMs ?? 1500, 0), 5000);
	const tailMs = Math.min(Math.max(opts.tailMs ?? 500, 0), 10000);
	const leadMs = Math.min(Math.max(opts.leadMs ?? 100, 0), 2000);
	const sr = SIT_SAMPLE_RATE;
	const ms = (n: number) => Math.round((n / 1000) * sr);
	const segs = SIT_CODES[code].segments;

	const sitSamples = segs.reduce((sum, [, d]) => sum + ms(d), 0);
	const total = ms(leadMs) + repeats * sitSamples + (repeats - 1) * ms(gapMs) + ms(tailMs);
	const pcm = new Int16Array(total);
	const amp = 0.5 * 32767; // about -6 dBFS; equal level on all three segments (spec: < 3 dB variation)
	const ramp = ms(2); // 2 ms raised-cosine edges avoid clicks without exceeding the 4 ms gap limit

	let pos = ms(leadMs);
	for (let r = 0; r < repeats; r++) {
		for (const [freq, dur] of segs) {
			const n = ms(dur);
			for (let i = 0; i < n; i++) {
				let env = 1;
				if (i < ramp) env = 0.5 - 0.5 * Math.cos((Math.PI * i) / ramp);
				else if (i > n - ramp) env = 0.5 - 0.5 * Math.cos((Math.PI * (n - i)) / ramp);
				pcm[pos + i] = Math.round(amp * env * Math.sin((2 * Math.PI * freq * i) / sr));
			}
			pos += n;
		}
		if (r < repeats - 1) pos += ms(gapMs);
	}

	const dataBytes = pcm.length * 2;
	const buf = new ArrayBuffer(44 + dataBytes);
	const view = new DataView(buf);
	const str = (off: number, s: string) => {
		for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
	};
	str(0, 'RIFF');
	view.setUint32(4, 36 + dataBytes, true);
	str(8, 'WAVE');
	str(12, 'fmt ');
	view.setUint32(16, 16, true); // PCM chunk size
	view.setUint16(20, 1, true); // PCM format
	view.setUint16(22, 1, true); // mono
	view.setUint32(24, sr, true);
	view.setUint32(28, sr * 2, true); // byte rate
	view.setUint16(32, 2, true); // block align
	view.setUint16(34, 16, true); // bits per sample
	str(36, 'data');
	view.setUint32(40, dataBytes, true);
	for (let i = 0; i < pcm.length; i++) view.setInt16(44 + i * 2, pcm[i], true);
	return new Uint8Array(buf);
}
