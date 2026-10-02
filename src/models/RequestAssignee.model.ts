import { RequestAssigneeRole } from './common/general'

export interface IRequestAssignee {
	requestId: string;
	technicianId: string;
	role: RequestAssigneeRole;
	plannedHours: number;
	createdAt: Date; // ISO Date-time
	updatedAt: Date; // ISO Date-time
}

export interface RequestAssigneeCreateDto {
	requestId: string;
	technicianId: string;
	role: RequestAssigneeRole;
	plannedHours: number;
}

export type RequestAssigneePatchDto = Partial<Omit<RequestAssigneeCreateDto, 'requestId' | 'technicianId'>>;

// Functions

function new_(dto: RequestAssigneeCreateDto): IRequestAssignee {
	const now = new Date();
	return {
		requestId: dto.requestId,
		technicianId: dto.technicianId,
		role: dto.role,
		plannedHours: dto.plannedHours,
		createdAt: now,
		updatedAt: now,
	};
}

export default {
	new: new_,
} as const;