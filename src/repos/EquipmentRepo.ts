import { IEquipment } from '@src/models/Equipment.model'
import { v4 } from 'uuid'
import orm from './MockOrm'

// Functions

async function getOne(id: string): Promise<IEquipment | null> {
	const db = await orm.openDb();
	return db.equipments.find(equipment => equipment.id === id) ?? null;
}

async function persists(id: string): Promise<boolean> {
	const db = await orm.openDb();
	const equipmentIds = new Set(
    db.equipments.map(equipment => equipment.id)
	);
	return equipmentIds.has(id);
}

async function getAll(): Promise<IEquipment[]> {
	const db = await orm.openDb();
	return db.equipments;
}

async function add(equipment: IEquipment): Promise<void> {
	const db = await orm.openDb();
	equipment.id = v4().toString(); // generate uuid V4
	equipment.installedAt = new Date().toISOString();
	db.equipments.push(equipment);
	return orm.saveDb(db);
}

async function updateOne(id: string, equipment: IEquipment): Promise<void> {
	const db = await orm.openDb();
	for (let i = 0; i < db.equipments.length; i++) {
		if (db.equipments[i].id === equipment.id) {
			const dbEquipment = db.equipments[i];
			db.equipments[i] = {
				...dbEquipment,
				name: equipment.name,
				
			}
		}
	}
}

async function delete_(id: string): Promise<void> {
	const db = await orm.openDb();
	for (let i = 0; i < db.equipments.length; i++) {
		if (db.equipments[i].id === id) {
			db.equipments.splice(i, 1);
			return orm.saveDb(db);
		}
	}
}

/**
 * @testOnly
 * 
 * Delete every equipment record
 */
async function deleteAllEquipments(): Promise<void> {
	const db = await orm.openDb();
	db.equipments = [];
	return orm.saveDb(db);
}

/**
 * @testOnly
 * 
 * Insert multiple equipments. Can't do multiple at once cause using a plain file
 */
async function insertMultiple(
	equipments: IEquipment[] | readonly IEquipment[]): Promise<IEquipment[]> {
		const db = await orm.openDb(), equipmentF = [...equipments];
		for (const equipment of equipmentF) {
			equipment.id = v4().toString();
			equipment.installedAt = new Date();
		}
		db.equipments = [...db.equipments, ...equipments];
		await orm.saveDb(db);
		return equipmentF;
}

export default {
	getOne,
	getAll,
	persists,
	add,
	updateOne,
	delete: delete_,
	deleteAllEquipments,
	insertMultiple,
}