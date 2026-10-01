import { MaintenanceRequest, Technician } from '@src/db/models'
import { IMaintenanceRequest, RequestCreateDto, RequestPatchDto } from '@src/models/Maintenance.model'
import { Includeable, Transaction, WhereOptions } from 'sequelize'
import { ASSIGNEE_THROUGH_ATTRS, map2IMaintenanceRequest, TECHNICIAN_ATTRS } from './common/map'
import { buildOrder, dateRange, pageToLimitOffset, SortMap } from './common/query-utils'
import { Tx, TxOpts } from './common/tx'
import { IMaintenanceRequestRepo, ListQuery, ListResult, RequestFilter } from './types'

// Constants

const SORT_MAP: SortMap = {
	title: 'title',
	priority: 'priority', // ENUM сортируется в порядке объявления: low < medium < high < critical
	status: 'status',
	plannedAt: 'plannedAt',
	createdAt: 'createdAt',
	updatedAt: 'updatedAt',
};

const withAssignees: Includeable = {
	model: Technician,
	as: 'assignees',
	attributes: [...TECHNICIAN_ATTRS],
	through: { attributes: [...ASSIGNEE_THROUGH_ATTRS] },
	required: false,
};

// Functions

async function findMany(q: ListQuery<RequestFilter>, opts?: TxOpts): Promise<ListResult<IMaintenanceRequest>> {
	const { filter: f, sort, page, limit } = q;
	const createdAt = dateRange(f.createdFrom, f.createdTo);
	const plannedAt = dateRange(f.plannedFrom, f.plannedTo); // без диапазона заявки без plannedAt не отбрасываются
	const cond: WhereOptions = {
		...(f.status ? { status: f.status } : {}),
		...(f.priority ? { priority: f.priority } : {}),
		...(f.equipmentId ? { equipmentId: f.equipmentId } : {}),
		...(createdAt ? { createdAt } : {}),
		...(plannedAt ? { plannedAt } : {}),
	};
	const { rows, count } = await MaintenanceRequest.findAndCountAll({
		where: cond,
		order: buildOrder(sort, SORT_MAP),
		...pageToLimitOffset(page, limit),
		transaction: opts?.tx,
	});
	return { items: rows.map(map2IMaintenanceRequest), total: count };
}

async function findById(id: string, opts?: TxOpts): Promise<IMaintenanceRequest | null> {
	const r = await MaintenanceRequest.findByPk(id, { include: [withAssignees], transaction: opts?.tx });
	return r ? map2IMaintenanceRequest(r) : null;
}

/** Блокирует строку заявки до конца транзакции (SELECT ... FOR UPDATE) */
async function findByIdForUpdate(id: string, tx: Tx): Promise<IMaintenanceRequest | null> {
	const r = await MaintenanceRequest.findByPk(id, { transaction: tx, lock: Transaction.LOCK.UPDATE });
	return r ? map2IMaintenanceRequest(r) : null;
}

async function countByEquipmentAndStatuses(equipmentId: string, statuses: readonly string[], opts?: TxOpts): Promise<number> {
	return MaintenanceRequest.count({ where: { equipmentId, status: [...statuses] }, transaction: opts?.tx });
}

async function create(dto: RequestCreateDto, opts?: TxOpts): Promise<IMaintenanceRequest> {
	const created = await MaintenanceRequest.create({
		equipmentId: dto.equipmentId,
		title: dto.title,
		description: dto.description ?? null,
		priority: dto.priority,
		plannedAt: dto.plannedAt ?? null,
		author: dto.author ?? null,
	}, { transaction: opts?.tx });
	return map2IMaintenanceRequest(created);
}

async function update(id: string, patch: RequestPatchDto, opts?: TxOpts): Promise<IMaintenanceRequest | null> {
	const current = await MaintenanceRequest.findByPk(id, { transaction: opts?.tx });
	if (!current) return null;
	await current.update({
		...(patch.title !== undefined ? { title: patch.title } : {}),
		...(patch.description !== undefined ? { description: patch.description } : {}),
		...(patch.priority !== undefined ? { priority: patch.priority } : {}),
		...(patch.status !== undefined ? { status: patch.status } : {}),
		...(patch.plannedAt !== undefined ? { plannedAt: patch.plannedAt } : {}),
		...(patch.author !== undefined ? { author: patch.author } : {}),
	}, { transaction: opts?.tx });
	return findById(id, opts);
}

/** soft delete */
async function delete_(id: string, opts?: TxOpts): Promise<boolean> {
	const affected = await MaintenanceRequest.destroy({ where: { id }, transaction: opts?.tx });
	return affected > 0;
}

/**
 * @testOnly
 */
async function deleteAllRequests(): Promise<void> {
	await MaintenanceRequest.destroy({ where: {}, force: true });
}

/**
 * @testOnly
 */
async function insertMultiple(requests: IMaintenanceRequest[] | readonly IMaintenanceRequest[]): Promise<void> {
	await MaintenanceRequest.bulkCreate(requests.map((r) => ({
		id: r.id,
		equipmentId: r.equipmentId,
		title: r.title,
		description: r.description ?? null,
		priority: r.priority,
		status: r.status,
		plannedAt: r.plannedAt,
		author: r.author,
		createdAt: r.createdAt,
		updatedAt: r.updatedAt,
	})));
}

const MaintenanceRequestRepo: IMaintenanceRequestRepo = {
	findMany,
	findById,
	findByIdForUpdate,
	countByEquipmentAndStatuses,
	create,
	update,
	delete: delete_,
};

export default {
	...MaintenanceRequestRepo,
	deleteAllRequests,
	insertMultiple,
} as const;

