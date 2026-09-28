import { REQUEST_PRIORITIES, REQUEST_STATUSES } from '@src/common/utils/validators'
import { v4 } from 'uuid'

// Types

export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

/**
 * @entity maintenance_request
 */
export interface IMaintenanceRequest {
	id: string; // @PK uuid
	equipmentId: string; // @FK
	title: string; // @REQUIRED
	description?: string;
	priority: RequestPriority;
	status: RequestStatus; // BY DEFAULT 'new'
	plannedAt?: string; // ISO Date-time
	createdAt: string; // ISO Date-time
	updatedAt: string; // ISO Date-time
}

export interface RequestCreateDto {
	equipmentId: string;
	title: string;
	description?: string;
	priority: RequestPriority;
	plannedAt?: Date;
}

export type RequestPatchDto = Partial<Omit<RequestCreateDto, 'equipmentId'>>;

export type IMaintenanceRequestChanges = Partial<
	Pick<IMaintenanceRequest, 'title' | 'description' | 'priority' | 'plannedAt' | 'status'>
>;

// Functions

function new_(dto: RequestCreateDto): IMaintenanceRequest {
	const now = new Date().toISOString();
	return {
		id: v4(),
		equipmentId: dto.equipmentId,
		title: dto.title,
		...(dto.description !== undefined ? { description: dto.description } : {}),
		priority: dto.priority,
		status: 'new',
		...(dto.plannedAt ? { plannedAt: dto.plannedAt.toISOString() } : {}),
		createdAt: now,
		updatedAt: now,
	};
}

export default {
	new: new_,
} as const;
