import { defineSchema } from './defineSchema'
import { isoDate, queryInt, sortParam } from './validators'

export const EQUIPMENT_LOAD_SORT = ['name', 'requestsTotal', 'requestsClosed', 'plannedHoursTotal', 'lastServiceAt'] as const;

export interface EquipmentLoadParams {
	from: Date;
	to: Date;
	minRequests?: number;
	sort?: string;
	limit?: number;
	offset?: number;
}

export const ReportSchemas = {
	equipmentLoad: defineSchema<EquipmentLoadParams>({
		from: isoDate,
		to: isoDate,
		minRequests: queryInt(0, 100_000),
		sort: sortParam(EQUIPMENT_LOAD_SORT),
		limit: queryInt(1, 100),
		offset: queryInt(0, 100_000),
	}, {
		from: 'Обязательная ISO-дата',
		to: 'Обязательная ISO-дата',
		minRequests: 'Целое число от 0',
		sort: `Одно из ${EQUIPMENT_LOAD_SORT.join(', ')}; "-" перед полем — по убыванию`,
		limit: 'Целое число от 1 до 100',
		offset: 'Целое число от 0 до 100000',
	}),
};
