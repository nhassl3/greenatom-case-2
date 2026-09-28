import { IEquipment, IEquipmentPatch } from '@src/models/Equipment.model'
import { inDateRange, paginate, sortBy } from './common/list-utils'
import orm from './MockOrm'
import { EquipmentFilter, IEquipmentRepo, ListQuery, ListResult } from './types'

// Functions

const normalizeSerial = (serial: string) => serial.trim().toLowerCase();

async function findMany(q: ListQuery<EquipmentFilter>): Promise<ListResult<IEquipment>> {
	const { filter: f, sort, page, limit } = q;
	const db = await orm.openDb();
	const filtered = db.equipments.filter((e) =>
		(!f.status || e.status === f.status) &&
		(!f.type || e.type === f.type) &&
		inDateRange(e.installedAt, f.installedFrom, f.installedTo),
	);
	return paginate(sortBy(filtered, sort), page, limit);
}

async function findById(id: string): Promise<IEquipment | null> {
	const db = await orm.openDb();
	return db.equipments.find((e) => e.id === id) ?? null;
}

async function findBySerialNumber(serial: string): Promise<IEquipment | null> {
	const db = await orm.openDb();
	const wanted = normalizeSerial(serial);
	return db.equipments.find((e) => normalizeSerial(e.serialNumber) === wanted) ?? null;
}

async function create(equipment: IEquipment): Promise<IEquipment> {
	const db = await orm.openDb();
	db.equipments.push(equipment);
	await orm.saveDb(db);
	return equipment;
}

async function update(id: string, patch: IEquipmentPatch): Promise<IEquipment | null> {
	const db = await orm.openDb();
	const i = db.equipments.findIndex((e) => e.id === id);
	if (i === -1) return null;
	const current = db.equipments[i];
	const { location, ...rest } = patch;
	db.equipments[i] = {
		...current,
		...rest,
		id: current.id,
		location: {
			lat: location?.lat ?? current.location.lat,
			lon: location?.lon ?? current.location.lon,
		},
	};
	await orm.saveDb(db);
	return db.equipments[i];
}

async function delete_(id: string): Promise<boolean> {
	const db = await orm.openDb();
	const i = db.equipments.findIndex((e) => e.id === id);
	if (i === -1) return false;
	db.equipments.splice(i, 1);
	await orm.saveDb(db);
	return true;
}

/**
 * @testOnly
 */
async function deleteAllEquipments(): Promise<void> {
	const db = await orm.openDb();
	db.equipments = [];
	return orm.saveDb(db);
}

/**
 * @testOnly
 */
async function insertMultiple(equipments: IEquipment[] | readonly IEquipment[]): Promise<IEquipment[]> {
	const db = await orm.openDb();
	db.equipments = [...db.equipments, ...equipments];
	await orm.saveDb(db);
	return [...equipments];
}

const EquipmentRepo: IEquipmentRepo = {
	findMany,
	findById,
	findBySerialNumber,
	create,
	update,
	delete: delete_,
};

export default {
	...EquipmentRepo,
	deleteAllEquipments,
	insertMultiple,
} as const;
