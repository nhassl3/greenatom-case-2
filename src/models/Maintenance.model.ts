import { isMaintenancePriority, isMaintenanceStatus, isValidUUID, transformIsDate } from '@src/common/utils/validators'
import { isNonEmptyString, isString } from 'jet-validators'
import { makeOptional, parseObject, Schema, testObject } from 'jet-validators/utils'
import { v4 } from 'uuid'

const GetDefaults = (): IMaintenanceRequest => ({
	id: v4(),
	equipmentId: v4(),
	title: "Some title",
	description: "Some description for some title",
	priority: "critical",
	status: "new",
	plannedAt: new Date(),
	createdAt: new Date(),
	updatedAt: new Date(),
});

const schema: Schema<IMaintenanceRequest> = {
	id: isString,
	equipmentId: isString,
	title: isString,
	description: isString,
	priority: isMaintenancePriority,
	status: isMaintenanceStatus,
	plannedAt: transformIsDate,
	createdAt: transformIsDate,
	updatedAt: transformIsDate,
}

// type

export interface IMaintenanceRequest {
	id: string; // @PK uuid
	equipmentId: string; // @FK
	title: string; // @REQUIRED
	description: string;
	priority: string; // CHECK IN ('low', 'medium', 'high', 'critical')
	status: string; // CHECK IN ('new', 'in_progress', 'done', 'rejected') BY DEFAULT 'new'
	plannedAt?: Date | string // ISO Date-time
	createdAt: Date | string // ISO Date-time
	updatedAt: Date | string // ISO Date-time
}

export type IMaintenanceRequestPatch = Partial<Omit<IMaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'equipmentId' | 'status'>>

// new -> in_progress -> done; new -> rejected; new -> in_progress -> rejected;

const parseMaintenanceRequest = parseObject<IMaintenanceRequest>(schema);

const isCompleteMaintenanceRequest = testObject<IMaintenanceRequest>({
	...schema,
	id: isValidUUID,
	title: isNonEmptyString,
})

const isNewMaintenanceRequest = testObject<Omit<IMaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>>({
	equipmentId: isValidUUID,
	title: isNonEmptyString,
	description: isNonEmptyString,
	priority: isMaintenancePriority,
	status: isMaintenanceStatus,
	plannedAt: makeOptional(transformIsDate),
})

const isPartialMaintenanceRequest = testObject<IMaintenanceRequestPatch>({
	title: makeOptional(isNonEmptyString),
	description: makeOptional(isString),
	priority: makeOptional(isMaintenancePriority),
	plannedAt: makeOptional(transformIsDate)
})

function new_(maintenanceRequest?: Partial<IMaintenanceRequest>): IMaintenanceRequest {
	return parseMaintenanceRequest({ ...GetDefaults(), ...maintenanceRequest}, (errors) => {
		throw new Error('Setup new maintenance request failed ' + JSON.stringify(errors, null, 2));
	});
}

export default {
	new: new_,
	isComplete: isCompleteMaintenanceRequest,
	isNew: isNewMaintenanceRequest,
	isPartial: isPartialMaintenanceRequest,
} as const;