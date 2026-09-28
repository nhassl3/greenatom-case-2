import { makeOptional, testObject } from 'jet-validators/utils'
import { defineSchema } from './defineSchema'
import { EQUIPMENT_STATUSES, EQUIPMENT_TYPES, numberInRange, oneOf, optional, optionalIsoDate, optionalIsoDateNotInFuture, optionalStringLength, queryInt, sortParam, stringLength } from './validators'

const EQUIPMENT_SORT = ['name', 'serialNumber', 'installedAt', 'status', 'type'] as const;

const createFields = {
	name: stringLength(3, 100),
	type: oneOf(EQUIPMENT_TYPES),
	serialNumber: stringLength(1, 64),
	location: { lat: numberInRange(-90, 90), lon: numberInRange(-180, 180)},
	status: optional(oneOf(EQUIPMENT_STATUSES)),
	installedAt: optionalIsoDateNotInFuture,
};

const messages = {
	name: "Обязательная строка длиной от 3 до 100 символов",
	type: `Допустимые значения: ${EQUIPMENT_TYPES.join(', ')}`,
	serialNumber: 'Обязательная непустая строка до 64 символов',
	location: 'Объект {lat, lon}: lat от -90 до 90, lon от -180 до 180',
	'location.lat': 'Число от -90 до 90',
	'location.lon': 'Число от -180 до 180',
	status: `Допустимые значения: ${EQUIPMENT_STATUSES.join(', ')}`,
	installedAt: 'ISO-дата, не в будущем',
}

export interface EquipmentListQuery {
	status?: string;
	type?: string;
	installedFrom?: Date;
	installedTo?: Date;
	sort?: string;
	page?: number;
	limit?: number;
}

export const EquipmentSchemas = {
	create: defineSchema(createFields, messages),
	patch: defineSchema({
		name: optionalStringLength(3, 100),
		type: optional(oneOf(EQUIPMENT_TYPES)),
		serialNumber: optionalStringLength(1, 64),
		location: makeOptional(testObject({
			lat: makeOptional(numberInRange(-90, 90)),
			lon: makeOptional(numberInRange(-180, 180)),
		})),
		status: optional(oneOf(EQUIPMENT_STATUSES)),
		installedAt: optionalIsoDateNotInFuture,
	}, messages),
	listQuery: defineSchema<EquipmentListQuery>({
		status: optional(oneOf(EQUIPMENT_STATUSES)),
		type: optional(oneOf(EQUIPMENT_TYPES)),
		installedFrom: optionalIsoDate,
		installedTo: optionalIsoDate,
		sort: sortParam(EQUIPMENT_SORT),
		page: queryInt(1, 100_000),
		limit: queryInt(1, 100),
	}, {
		...messages,
		installedFrom: 'ISO-дата',
		installedTo: 'ISO-дата',
		sort: `Одно из ${EQUIPMENT_SORT.join(', ')}; "-" перед полем — по убыванию`,
		page: 'Целое число от 1 до 100000',
		limit: 'Целое число от 1 до 100',
	}),
};
