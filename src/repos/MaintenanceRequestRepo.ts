import { IMaintenanceRequest, IMaintenanceRequestPatch } from '@src/models/Maintenance.model'
import { v4 } from 'uuid'
import orm from './MockOrm'

async function getOne(id: string): Promise<IMaintenanceRequest | null> {
	return (await orm.openDb()).maintenances.find(request => request.id === id) ?? null;
}

async function persists(id: string): Promise<boolean> {
	return new Set((await orm.openDb()).maintenances.map(request => request.id)).has(id);
}

async function getAll(): Promise<IMaintenanceRequest[]> {
	return (await orm.openDb()).maintenances;
}

async function add(request: IMaintenanceRequest): Promise<void> {
	const db = await orm.openDb();
	request.id = v4().toString();
	request.createdAt = new Date().toISOString();
	request.updatedAt = new Date().toISOString();
	db.maintenances.push(request);
	return orm.saveDb(db);
}

async function update(id: string, request: IMaintenanceRequestPatch): Promise<void> {
	const db = await orm.openDb();
	for (let i = 0; i < db.maintenances.length; i++) {
		if (db.maintenances[i].id === id) {
			const dbRequest = db.maintenances[i];
			db.maintenances[i] = {
				...dbRequest,
				...request,
				id: dbRequest.id,
				equipmentId: dbRequest.equipmentId,
				status: dbRequest.status,
				createdAt: dbRequest.createdAt,
				updatedAt: new Date().toISOString(),
			};
			return orm.saveDb(db);
		}
	}
}

async function updateStatus(id: string, status: string): Promise<void> {
	const db = await orm.openDb();
	for (let i = 0; i < db.maintenances.length; i++) {
		if (db.maintenances[i].id === id) {
			const dbRequest = db.maintenances[i];
			db.maintenances[i] = {
				...dbRequest,
				status: status,
				updatedAt: new Date().toISOString(),
			};
			return orm.saveDb(db);
		}
	}
}

async function delete_(id: string): Promise<void> {
	const db = await orm.openDb();
	for (let i = 0; i < db.maintenances.length; i++) {
		if (db.maintenances[i].id === id) {
			db.maintenances.splice(i, 1);
			return orm.saveDb(db);
		}
	}
}

async function getAllRequestsByEqipmentId(eqipment_id: string): Promise<IMaintenanceRequest[]> {
	return (await orm.openDb()).maintenances.filter(request => request.equipmentId === eqipment_id)
}

export default {
	getOne,
	getAll,
	persists,
	add,
	update,
	updateStatus,
	delete: delete_,
	getAllRequestsByEqipmentId
} as const;