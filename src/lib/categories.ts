export const CATEGORIES = [
	{ id: 'robocall', label: 'Robocall' },
	{ id: 'scam', label: 'Scam' },
	{ id: 'telemarketer', label: 'Telemarketer' },
	{ id: 'debt_collector', label: 'Debt collector' },
	{ id: 'legit_business', label: 'Legit business' },
	{ id: 'other', label: 'Other' }
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

const labels = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<
	CategoryId,
	string
>;

export function isCategory(value: string): value is CategoryId {
	return value in labels;
}

export function categoryLabel(id: CategoryId): string {
	return labels[id];
}
