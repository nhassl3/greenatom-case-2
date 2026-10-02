import { RequestStatus } from './common/general'

export interface IRequestStatusHistory {
	id: string;
	requestId: string;
	oldStatus: RequestStatus | null;
	newStatus: RequestStatus;
	changedBy: string | null;
	comment: string | null;
	changedAt: Date;
}

export interface RequestStatusHistoryCreateDto {
	id: string;
	requestId: string;
	oldStatus: RequestStatus | null;
	newStatus: RequestStatus;
	changedBy: string | null;
	comment: string | null;
	changedAt: Date;
}

export type RequestStatusHistoryPatchDto = Partial<Omit<RequestStatusHistoryCreateDto, 'requestId' | 'id'>>;

// Functions 

function new_(dto: RequestStatusHistoryCreateDto): IRequestStatusHistory {
	return {
		id: dto.id,
		requestId: dto.requestId,
		oldStatus: dto.oldStatus ?? 'new',
		newStatus: dto.newStatus,
		changedBy: dto.changedBy ?? null,
		comment: dto.comment ?? null,
		changedAt: dto.changedAt,
	};
}

export default {
	new: new_,
} as const;