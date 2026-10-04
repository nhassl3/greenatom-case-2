import type { RequestCreateDto } from '@src/models/Maintenance.model'
import type { RequestStatus } from '@src/models/common/general'
import { defineSchema } from './defineSchema'
import { arrayOfLength, ASSIGNEE_ROLES, isUuid, oneOf, optional, optionalIsoDate, optionalStringLength, queryInt, REQUEST_PRIORITIES, REQUEST_STATUSES, sortParam, stringLength } from './validators'

const REQUEST_SORT = ['createdAt', 'updatedAt', 'plannedAt', 'priority', 'status', 'title'] as const;
export const BULK_MAX_ITEMS = 100;
export const ASSIGNEES_MAX = 20;
export const MAX_PLANNED_HOURS = 999.99;

export interface AssigneeItem {
	technicianId: string;
	role: (typeof ASSIGNEE_ROLES)[number];
	plannedHours: number;
}

const isAssigneeItem = (v: unknown): v is AssigneeItem => {
	if (typeof v !== 'object' || v === null) return false;
	const { technicianId, role, plannedHours } = v as Record<string, unknown>;
	return isUuid(technicianId)
		&& (ASSIGNEE_ROLES as readonly unknown[]).includes(role)
		&& typeof plannedHours === 'number' && plannedHours > 0 && plannedHours <= MAX_PLANNED_HOURS;
};

// 1..20 исполнителей, ровно один lead
const isAssigneeList = (v: unknown): v is AssigneeItem[] =>
	Array.isArray(v) && v.length >= 1 && v.length <= ASSIGNEES_MAX && v.every(isAssigneeItem)
	&& v.filter((a) => a.role === 'lead').length === 1;

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
	status: defineSchema<{ status: RequestStatus }>({ status: oneOf(REQUEST_STATUSES) }, messages),
	listQuery: defineSchema<RequestListQuery>({
		...listFilterFields,
		equipmentId: optional(isUuid),
	}, listMessages),
	equipmentListQuery: defineSchema<Omit<RequestListQuery, 'equipmentId'>>(listFilterFields, listMessages),
	assignees: defineSchema<{ assignees: AssigneeItem[] }>({
		assignees: isAssigneeList,
	}, { assignees: `Массив из 1–${ASSIGNEES_MAX} элементов {technicianId: UUID, role: ${ASSIGNEE_ROLES.join('|')}, plannedHours: 0 < x ≤ ${MAX_PLANNED_HOURS}}, ровно один lead` }),
	bulk: defineSchema<{ items: unknown[] }>({
		items: arrayOfLength(1, BULK_MAX_ITEMS),
	}, { items: `Массив из 1–${BULK_MAX_ITEMS} заявок` }),
}