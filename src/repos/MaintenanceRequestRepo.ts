import { IMaintenanceRequest, IMaintenanceRequestChanges } from '@src/models/Maintenance.model'
import { inDateRange, paginate, sortBy } from './common/list-utils'
import orm from './MockOrm'
import { IMaintenanceRequestRepo, ListQuery, ListResult, RequestFilter } from './types'

// Constants

const PRIORITY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };

// Functions

async function findMany(q: ListQuery<RequestFilter>): Promise<ListResult<IMaintenanceRequest>> {
	const { filter: f, sort, page, limit } = q;
	const db = await orm.openDb();
	const filtered = db.maintenances.filter((r) =>
		(!f.status || r.status === f.status) &&
		(!f.priority || r.priority === f.priority) &&
		(!f.equipmentId || r.equipmentId === f.equipmentId) &&
		inDateRange(r.createdAt, f.createdFrom, f.createdTo) &&
		inDateRange(r.plannedAt, f.plannedFrom, f.plannedTo),
	);
	return paginate(sortBy(filtered, sort, { priority: PRIORITY_RANK }), page, limit);
}

async function findById(id: string): Promise<IMaintenanceRequest | null> {
	const db = await orm.openDb();
	return db.maintenances.find((r) => r.id === id) ?? null;
}

async function countByEquipmentAndStatuses(equipmentId: string, statuses: readonly string[]): Promise<number> {
	const db = await orm.openDb();
	return db.maintenances.filter((r) => r.equipmentId === equipmentId && statuses.includes(r.status)).length;
}

async function create(request: IMaintenanceRequest): Promise<IMaintenanceRequest> {
	const db = await orm.openDb();
	db.maintenances.push(request);
	await orm.saveDb(db);
	return request;
}

async function update(id: string, patch: IMaintenanceRequestChanges): Promise<IMaintenanceRequest | null> {
	const db = await orm.openDb();
	const i = db.maintenances.findIndex((r) => r.id === id);
	if (i === -1) return null;
	const current = db.maintenances[i];
	db.maintenances[i] = {
		...current,
		...patch,
		id: current.id,
		equipmentId: current.equipmentId,
		createdAt: current.createdAt,
		updatedAt: new Date().toISOString(),
	};
	await orm.saveDb(db);
	return db.maintenances[i];
}

async function delete_(id: string): Promise<boolean> {
	const db = await orm.openDb();
	const i = db.maintenances.findIndex((r) => r.id === id);
	if (i === -1) return false;
	db.maintenances.splice(i, 1);
	await orm.saveDb(db);
	return true;
}

/**
 * @testOnly
 */
async function deleteAllRequests(): Promise<void> {
	const db = await orm.openDb();
	db.maintenances = [];
	return orm.saveDb(db);
}

/**
 * @testOnly
 */
async function insertMultiple(requests: IMaintenanceRequest[] | readonly IMaintenanceRequest[]): Promise<IMaintenanceRequest[]> {
	const db = await orm.openDb();
	db.maintenances = [...db.maintenances, ...requests];
	await orm.saveDb(db);
	return [...requests];
}

const MaintenanceRequestRepo: IMaintenanceRequestRepo = {
	findMany,
	findById,
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
