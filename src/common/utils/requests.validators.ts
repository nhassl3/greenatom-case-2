import type { RequestCreateDto } from '@src/models/Maintenance.model'
import { defineSchema } from './defineSchema'
import { arrayOfLength, isUuid, oneOf, optional, optionalIsoDate, optionalStringLength, queryInt, REQUEST_PRIORITIES, REQUEST_STATUSES, sortParam, stringLength } from './validators'

const REQUEST_SORT = ['createdAt', 'updatedAt', 'plannedAt', 'priority', 'status', 'title'] as const;
export const BULK_MAX_ITEMS = 100;

const messages = {
	equipmentId: "Требуется UUID оборудования",
	title: "Обязательная строка длиной от 5 до 120 символов",
	description: "Строка до 2000 символов",
	priority: `Допустимые значения: ${REQUEST_PRIORITIES.join(', ')}`,
	plannedAt: 'ISO-дата',
	status: `Допустимые значения: ${REQUEST_STATUSES.join(', ')}`,
};

export interface RequestListQuery {
	status?: string;
	priority?: string;
	equipmentId?: string;
	createdFrom?: Date;
	createdTo?: Date;
	plannedFrom?: Date;
	plannedTo?: Date;
	sort?: string;
	page?: number;
	limit?: number;
}

const listFilterFields = {
	status: optional(oneOf(REQUEST_STATUSES)),
	priority: optional(oneOf(REQUEST_PRIORITIES)),
	createdFrom: optionalIsoDate,
	createdTo: optionalIsoDate,
	plannedFrom: optionalIsoDate,
	plannedTo: optionalIsoDate,
	sort: sortParam(REQUEST_SORT),
	page: queryInt(1, 100_000),
	limit: queryInt(1, 100),
};

const listMessages = {
	...messages,
	createdFrom: 'ISO-дата',
	createdTo: 'ISO-дата',
	plannedFrom: 'ISO-дата',
	plannedTo: 'ISO-дата',
	sort: `Одно из ${REQUEST_SORT.join(', ')}; "-" перед полем — по убыванию`,
	page: 'Целое число от 1 до 100000',
	limit: 'Целое число от 1 до 100',
};

export const RequestSchemas = {
	create: defineSchema<RequestCreateDto>({
		equipmentId: isUuid,
		title: stringLength(5, 120),
		description: optionalStringLength(0, 2000),
		priority: oneOf(REQUEST_PRIORITIES),
		plannedAt: optionalIsoDate,
	}, messages),
	patch: defineSchema({
		title: optionalStringLength(5, 120),
		description: optionalStringLength(0, 2000),
		priority: optional(oneOf(REQUEST_PRIORITIES)),
		plannedAt: optionalIsoDate,
	}, messages),
	status: defineSchema({ status: oneOf(REQUEST_STATUSES) }, messages),
	listQuery: defineSchema<RequestListQuery>({
		...listFilterFields,
		equipmentId: optional(isUuid),
	}, listMessages),
	equipmentListQuery: defineSchema<Omit<RequestListQuery, 'equipmentId'>>(listFilterFields, listMessages),
	bulk: defineSchema<{ items: unknown[] }>({
		items: arrayOfLength(1, BULK_MAX_ITEMS),
	}, { items: `Массив из 1–${BULK_MAX_ITEMS} заявок` }),
}