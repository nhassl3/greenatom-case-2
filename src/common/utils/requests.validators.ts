import { makeOptional } from 'jet-validators/utils'
import { defineSchema } from './defineSchema'
import { isoDate, isUuid, oneOf, optional, queryInt, REQUEST_PRIORITIES, REQUEST_STATUSES, sortParam, stringLength } from './validators'

const REQUEST_SORT = ['createdAt', 'updatedAt', 'plannedAt', 'priority', 'status', 'title'] as const;

const messages = {
	equipmentId: "Требуется UUID оборудования",
	title: "Обязательная строка длиной от 5 до 120 символов",
	description: "Строка до 2000 символов",
	priority: `Допустимые значения: ${REQUEST_PRIORITIES.join(', ')}`,
	plannedAt: 'ISO-дата',
	status: `Допустимые значения: ${REQUEST_STATUSES.join(', ')}`,
};

export const RequestSchemas = {
	create: defineSchema({
		equipmentId: isUuid,
		title: stringLength(5, 120),
		description: makeOptional(stringLength(0, 2000)),
		priority: oneOf(REQUEST_PRIORITIES),
		plannedAt: makeOptional(isoDate),
	}, messages),
	patch: defineSchema({
		title: makeOptional(stringLength(5, 120)),
		description: makeOptional(stringLength(0, 2000)),
		priority: makeOptional(oneOf(REQUEST_PRIORITIES)),
		plannedAt: makeOptional(isoDate),
	}, messages),
	status: defineSchema({ status: oneOf(REQUEST_STATUSES)}, messages),
	listQuery: defineSchema({
    status: optional(oneOf(REQUEST_STATUSES)),
    priority: optional(oneOf(REQUEST_PRIORITIES)),
    equipmentId: optional(isUuid),
    createdFrom: makeOptional(isoDate), createdTo: makeOptional(isoDate),
    plannedFrom: makeOptional(isoDate), plannedTo: makeOptional(isoDate),
    sort: sortParam(REQUEST_SORT),
    page: queryInt(1, 100_000),
    limit: queryInt(1, 100),
  }, { 
		...messages,
		createdFrom: 'ISO-дата',
		plannedFrom: 'ISO-дата',
		sort: `Одно из ${REQUEST_SORT.join(', ')}`,
		page: 	'Целое число от 1 до 100.000',
		limit: 'Целое число от 1 до 100',
	}),
}