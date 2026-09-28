import { ListResult } from '../types'

// Functions

export function paginate<T>(items: T[], page: number, limit: number): ListResult<T> {
	const start = (page - 1) * limit;
	return { items: items.slice(start, start + limit), total: items.length };
}

export function sortBy<T>(
	items: T[],
	sort: string | undefined,
	rank: Record<string, Record<string, number>> = {},
): T[] {
	if (!sort) return items;
	const desc = sort.startsWith('-');
	const field = desc ? sort.slice(1) : sort;

	const val = (x: T): string | number | undefined => {
		const v = (x as Record<string, unknown>)[field];
		if (v === undefined || v === null) return undefined;
		if (rank[field]) return rank[field][v as string] ?? -1;
		if (v instanceof Date) return v.getTime();
		if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return new Date(v).getTime();
		if (typeof v === 'string') return v.toLowerCase();
		return v as number;
	};

	return [...items].sort((a, b) => {
		const va = val(a), vb = val(b);
		if (va === vb) return 0;
		if (va === undefined) return 1;
		if (vb === undefined) return -1;
		return (va < vb ? -1 : 1) * (desc ? -1 : 1);
	});
}

export function inDateRange(value: Date | string | undefined, from?: Date, to?: Date): boolean {
	if (!from && !to) return true;
	if (!value) return false;
	const t = new Date(value).getTime();
	return (!from || t >= from.getTime()) && (!to || t <= to.getTime());
}
