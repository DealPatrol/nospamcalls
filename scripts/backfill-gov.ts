import { readFileSync } from 'node:fs';
for (const line of readFileSync('.env', 'utf8').split('\n')) {
	const i = line.indexOf('=');
	if (i > 0 && !process.env[line.slice(0, i)]) process.env[line.slice(0, i)] = line.slice(i + 1).replace(/^"|"$/g, '');
}
const { ingestGovComplaints } = await import('../src/lib/server/gov.ts');
const days = Number(process.argv[2] ?? 60);
const res = await ingestGovComplaints({ days, fccLimit: 50000, ftcPages: Number(process.argv[3] ?? 4) });
console.log(JSON.stringify(res, null, 2));
