import { v4 as uuid } from 'uuid'
import { RequestPriority, RequestStatus } from './common/general'
import { IRequestAssignee } from './RequestAssignee.model'

// Types

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
	plannedAt?: Date | null; // optional ISO Date-time
	author: string;
	createdAt: Date; // ISO Date-time
	updatedAt: Date; // ISO Date-time
	assignees?: IAssignee[]; // только в карточке
}

export interface IAssignee {
	technicianId: string;
	fullName: string;
	role: IRequestAssignee['role'];
	plannedHours: number;
}

export interface RequestCreateDto {
	equipmentId: string;
	title: string;
	description?: string;
	priority: RequestPriority;
	author?: string;
	plannedAt: Date | null;
}

export type RequestPatchDto = Partial<Omit<RequestCreateDto, 'equipmentId'>> & { status?: RequestStatus };

// Functions

function new_(dto: RequestCreateDto): IMaintenanceRequest {
	const now = new Date();
	return {
		id: uuid(),
		equipmentId: dto.equipmentId,
		title: dto.title,
		...(dto.description !== undefined ? { description: dto.description } : {}),
		priority: dto.priority,
		status: 'new',
		plannedAt: dto.plannedAt,
		author: dto.author ?? '',
		createdAt: now,
		updatedAt: now,
	};
}

export default {
	new: new_,
} as const;
