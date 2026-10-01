import { Op, Order } from 'sequelize'

// Types

export type SortMap = Record<string, string>; // apiField -> имя атрибута модели

// Functions

export function buildOrder(sort: string | undefined, map: SortMap): Order {
	const order: [string, 'ASC' | 'DESC'][] = [];
	if (sort) {
		const desc = sort.startsWith('-');
		const column = map[desc ? sort.slice(1) : sort];
		if (column) order.push([column, desc ? 'DESC' : 'ASC']);
	}
	order.push(['id', 'ASC']);
	return order;
}

export function dateRange(from?: Date, to?: Date): Partial<Record<typeof Op.gte | typeof Op.lte, Date>> | undefined {
	if (!from && !to) return undefined;
	return {
		...(from ? { [Op.gte]: from } : {}),
		...(to ? { [Op.lte]: to } : {}),
	};
}

export function pageToLimitOffset(page: number, limit: number): { limit: number; offset: number } {
	return { limit, offset: (page - 1) * limit };
}
