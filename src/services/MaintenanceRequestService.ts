import { ConflictError, NotFoundError } from '@src/common/errors'
import { RequestListQuery } from '@src/common/utils/requests.validators'
import Maintenance, { IMaintenanceRequest, RequestCreateDto, RequestPatchDto } from '@src/models/Maintenance.model'
import { RequestStatus } from '@src/models/common/general'
import EquipmentRepo from '@src/repos/EquipmentRepo'
import RequestRepo from '@src/repos/MaintenanceRequestRepo'

// Constants

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;

export const Errors = {
	REQUEST_NOT_FOUND: { code: 'REQUEST_NOT_FOUND', message: 'Заявка не найдена' },
	EQUIPMENT_NOT_FOUND: { code: 'EQUIPMENT_NOT_FOUND', message: 'Оборудование не найдено' },
	INVALID_STATUS_TRANSITION: { code: 'INVALID_STATUS_TRANSITION' },
} as const;

export const AllowedStatusTransitions: Record<RequestStatus, readonly RequestStatus[]> = {
	new: ['in_progress', 'rejected'], // new -> in_progress -> done; new -> rejected;
	in_progress: ['done', 'rejected'], // in_progress -> rejected, in_progress -> done;
	done: [],
	rejected: [],
};

// Functions

async function list(query: RequestListQuery) {
	const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sort, ...filter } = query;
	const { items, total } = await RequestRepo.findMany({ filter, sort, page, limit });
	return { items, meta: { total, page, limit } };
}

async function getById(id: string): Promise<IMaintenanceRequest> {
	const request = await RequestRepo.findById(id);
	if (!request) throw new NotFoundError(Errors.REQUEST_NOT_FOUND.message, Errors.REQUEST_NOT_FOUND.code);
	return request;
}

async function create(dto: RequestCreateDto): Promise<IMaintenanceRequest> {
	if (!(await EquipmentRepo.findById(dto.equipmentId))) {
		throw new NotFoundError(Errors.EQUIPMENT_NOT_FOUND.message, Errors.EQUIPMENT_NOT_FOUND.code);
	}
	return RequestRepo.create(Maintenance.new(dto));
}

async function patch(id: string, dto: RequestPatchDto): Promise<IMaintenanceRequest> {
	await getById(id);
	const { plannedAt, ...rest } = dto;
	const updated = await RequestRepo.update(id, {
		...rest,
		...(plannedAt ? { plannedAt: plannedAt.toISOString() } : {}),
	});
	return updated!;
}

/**
 * Смена статуса по таблице AllowedStatusTransitions, иначе 409.
 */
async function changeStatus(id: string, status: RequestStatus): Promise<IMaintenanceRequest> {
	const request = await getById(id);
	if (!AllowedStatusTransitions[request.status].includes(status)) {
		throw new ConflictError(
			`Переход ${request.status} → ${status} недопустим`,
			Errors.INVALID_STATUS_TRANSITION.code,
		);
	}
	const updated = await RequestRepo.update(id, { status });
	return updated!;
}

async function remove(id: string): Promise<void> {
	await getById(id);
	await RequestRepo.delete(id);
}

export default {
	list,
	getById,
	create,
	patch,
	changeStatus,
	remove,
} as const;
