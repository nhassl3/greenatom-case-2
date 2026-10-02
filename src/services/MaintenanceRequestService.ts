import { ConflictError, NotFoundError, ValidationError } from '@src/common/errors'
import { AppError, ErrorDetail } from '@src/common/errors/AppError'
import { parseWithDetails } from '@src/common/utils/defineSchema'
import { AssigneeItem, RequestListQuery, RequestSchemas } from '@src/common/utils/requests.validators'
import { RequestStatus } from '@src/models/common/general'
import { IMaintenanceRequest, RequestCreateDto, RequestPatchDto } from '@src/models/Maintenance.model'
import { IRequestStatusHistory } from '@src/models/RequestStatusHistory.model'
import { runInTransaction } from '@src/repos/common/tx'
import EquipmentRepo from '@src/repos/EquipmentRepo'
import RequestRepo from '@src/repos/MaintenanceRequestRepo'
import AssigneeRepo from '@src/repos/RequestAssigneeRepo'
import HistoryRepo from '@src/repos/RequestStatusHistoryRepo'
import TechnicianRepo from '@src/repos/TechnicianRepo'

// Constants

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;

export const Errors = {
	REQUEST_NOT_FOUND: { code: 'REQUEST_NOT_FOUND', message: 'Заявка не найдена' },
	EQUIPMENT_NOT_FOUND: { code: 'EQUIPMENT_NOT_FOUND', message: 'Оборудование не найдено' },
	INVALID_STATUS_TRANSITION: { code: 'INVALID_STATUS_TRANSITION' },
	NO_ASSIGNEES: { code: 'NO_ASSIGNEES' },
	TECHNICIAN_NOT_FOUND: { code: 'TECHNICIAN_NOT_FOUND', message: 'Специалист не найден' },
	ASSIGNEE_NOT_FOUND: { code: 'ASSIGNEE_NOT_FOUND', message: 'Специалист не назначен на заявку' },
	DUPLICATE_ASSIGNEE: { code: 'DUPLICATE_ASSIGNEE' },
	LAST_ASSIGNEE: { code: 'LAST_ASSIGNEE' },
	LEAD_REMOVAL_FORBIDDEN: { code: 'LEAD_REMOVAL_FORBIDDEN' },
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

const notFound = () => new NotFoundError(Errors.REQUEST_NOT_FOUND.message, Errors.REQUEST_NOT_FOUND.code);

async function create(dto: RequestCreateDto): Promise<IMaintenanceRequest> {
	return runInTransaction(async (tx) => {
		if (!(await EquipmentRepo.findById(dto.equipmentId, { tx, lock: 'share' }))) {
			throw new NotFoundError(Errors.EQUIPMENT_NOT_FOUND.message, Errors.EQUIPMENT_NOT_FOUND.code);
		}
		const created = await RequestRepo.create(dto, { tx });
		await HistoryRepo.append({ requestId: created.id, oldStatus: null, newStatus: 'new', changedBy: created.author || null, comment: null }, { tx });
		return created;
	});
}

async function patch(id: string, dto: RequestPatchDto): Promise<IMaintenanceRequest> {
	const updated = await RequestRepo.update(id, dto);
	if (!updated) throw notFound();
	return updated;
}

/**
 * Смена статуса по таблице AllowedStatusTransitions, иначе 409
 */
async function changeStatus(id: string, status: RequestStatus): Promise<IMaintenanceRequest> {
	return runInTransaction(async (tx) => {
		const request = await RequestRepo.findByIdForUpdate(id, tx);
		if (!request) throw notFound();
		if (!AllowedStatusTransitions[request.status].includes(status)) {
			throw new ConflictError(`Переход ${request.status} → ${status} недопустим`, Errors.INVALID_STATUS_TRANSITION.code);
		}
		if (status === 'in_progress' && (await AssigneeRepo.countByRequest(id, { tx })) === 0) {
			throw new ConflictError('Нельзя начать работу без назначенных исполнителей', Errors.NO_ASSIGNEES.code);
		}
		await RequestRepo.update(id, { status }, { tx });
		await HistoryRepo.append({ requestId: id, oldStatus: request.status, newStatus: status, changedBy: null, comment: null }, { tx });
		return (await RequestRepo.findById(id, { tx }))!;
	});
}

/**
 * Полная замена бригады одной транзакцией (либо новая бригада, либо прежняя)
 */
async function assignCrew(id: string, assignees: AssigneeItem[]): Promise<IMaintenanceRequest> {
	const ids = assignees.map((a) => a.technicianId);
	if (new Set(ids).size !== ids.length) {
		throw new ConflictError('Специалист указан в списке более одного раза', Errors.DUPLICATE_ASSIGNEE.code);
	}
	return runInTransaction(async (tx) => {
		if (!(await RequestRepo.findByIdForUpdate(id, tx))) throw notFound();
		const found = new Set(await TechnicianRepo.findByIds(ids, { tx }));
		const missing = ids.filter((x) => !found.has(x));
		if (missing.length) {
			throw new NotFoundError(`${Errors.TECHNICIAN_NOT_FOUND.message}: ${missing.join(', ')}`, Errors.TECHNICIAN_NOT_FOUND.code);
		}
		await AssigneeRepo.replaceForRequest(id, assignees, { tx });
		return (await RequestRepo.findById(id, { tx }))!;
	});
}

/**
 * Снятие исполнителя
 */
async function unassign(id: string, technicianId: string): Promise<void> {
	await runInTransaction(async (tx) => {
		const request = await RequestRepo.findByIdForUpdate(id, tx);
		if (!request) throw notFound();
		const crew = await AssigneeRepo.findByRequest(id, { tx });
		const target = crew.find((a) => a.technicianId === technicianId);
		if (!target) throw new NotFoundError(Errors.ASSIGNEE_NOT_FOUND.message, Errors.ASSIGNEE_NOT_FOUND.code);
		if (request.status === 'in_progress' && crew.length === 1) {
			throw new ConflictError('Нельзя снять последнего исполнителя у заявки в работе', Errors.LAST_ASSIGNEE.code);
		}
		if (target.role === 'lead' && crew.length > 1) {
			throw new AppError(422, Errors.LEAD_REMOVAL_FORBIDDEN.code, 'Нельзя снять ведущего, пока в бригаде есть другие исполнители');
		}
		await AssigneeRepo.remove(id, technicianId, { tx });
	});
}

async function getHistory(id: string): Promise<IRequestStatusHistory[]> {
	await getById(id);
	return HistoryRepo.findByRequest(id);
}

async function remove(id: string): Promise<void> {
	if (!(await RequestRepo.delete(id))) throw notFound();
}

// Bulk

export interface BulkItemResult {
	index: number;
	status: number;
	data?: IMaintenanceRequest;
	error?: { code: string; message: string; details?: ErrorDetail[] };
}

async function createBulk(items: unknown[]) {
	const results: BulkItemResult[] = [];
	for (const [index, item] of items.entries()) {
		const parsed = parseWithDetails(RequestSchemas.create, item, `items[${index}]`);
		if (!parsed.ok) {
			const e = new ValidationError(parsed.details.map((d) => ({ ...d, field: `items[${index}].${d.field}` })), 422);
			results.push({ index, status: 422, error: { code: e.code, message: e.message, details: e.details } });
			continue;
		}
		try {
			results.push({ index, status: 201, data: await create(parsed.value) });
		} catch (err) {
			if (!(err instanceof AppError)) throw err;
			results.push({ index, status: err.status, error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) } });
		}
	}
	const created = results.filter((r) => r.status === 201).length;
	return { total: items.length, created, failed: items.length - created, results };
}

export default {
	list,
	getById,
	create,
	createBulk,
	patch,
	changeStatus,
	assignCrew,
	unassign,
	getHistory,
	remove,
} as const;
