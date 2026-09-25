import { makeOptional, testObject } from 'jet-validators/utils'
import { defineSchema } from './defineSchema'
import { EQUIPMENT_STATUSES, EQUIPMENT_TYPES, isoDate, isoDateNotInFuture, numberInRange, oneOf, optional, queryInt, sortParam, stringLength } from './validators'

const EQUIPMENT_SORT = ['name', 'serialNumber', 'installedAt', 'status', 'type'] as const;

const createFields = {
	name: stringLength(3, 100),
	type: oneOf(EQUIPMENT_TYPES),
	serialNumber: stringLength(1, 64),
	location: { lat: numberInRange(-90, 90), lon: numberInRange(-180, 180)},
	status: optional(oneOf(EQUIPMENT_STATUSES)),
	installedAt: isoDateNotInFuture,
};

const messages = {
	name: "Обязательная строка длинной от 3 до 100 символов",
	type: `Допустимые значения: ${EQUIPMENT_TYPES.join(', ')}`,
	serialNumber: 'Обязательная непустая строка до 64 символов',
	location: 'Объект {lat, lon}',
	'location.lat': 'Число от -90 до 90',
	'location.lon': 'Число от -180 до 180',
	status: `Допустимые значения: ${EQUIPMENT_STATUSES.join(', ')}`,
	installedAt: 'ISO-дата, не в будущем',
}

export const EquipmentSchemas = {
	create: defineSchema(createFields, messages),
	patch: defineSchema({
		name: makeOptional(stringLength(3, 100)),
		type: makeOptional(oneOf(EQUIPMENT_TYPES)),
		serialNumber: makeOptional(stringLength(1, 64)),
		location: makeOptional(testObject({
			lat: makeOptional(numberInRange(-90, 90)),
			lon: makeOptional(numberInRange(-180, 180)),
		})),
		status: makeOptional(oneOf(EQUIPMENT_STATUSES)),
		installedAt: makeOptional(isoDateNotInFuture),
}, messages),
	listQuery: defineSchema({
		status: optional(oneOf(EQUIPMENT_STATUSES)),
		type: optional(oneOf(EQUIPMENT_TYPES)),
		installedFrom: makeOptional(isoDate),
		installedTo: makeOptional(isoDate),
		sort: sortParam(EQUIPMENT_SORT),
		page: queryInt(1, 100_000),
		limit: queryInt(1, 100),
	}, {
		...messages,
		installedFrom: 'ISO-дата',
		installedTo: 'ISO-дата',
		sort: `Одно из ${EQUIPMENT_SORT.join(', ')}`,
		page: 	'Целое число от 1 до 100.000',
		limit: 'Целое число от 1 до 100',
	}),
};
