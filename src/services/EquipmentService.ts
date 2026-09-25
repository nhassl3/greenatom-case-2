import HttpStatusCodes from '@src/common/constants/HttpStatusCodes'
import { RouteError } from '@src/common/utils/route-errors'
import { IEquipment, IEquipmentPatch } from '@src/models/Equipment.model'
import { IMaintenanceRequest } from '@src/models/Maintenance.model'
import EquipmentRepo from '@src/repos/EquipmentRepo'
import RequestRepo from '@src/repos/MaintenanceRequestRepo'

// Constants
const Errors = {
	EQUIPMENT_NOT_FOUND: 'Equipment not found',
} as const;

// Functions

const generateNotFoundError = (): RouteError => {
	return new RouteError(HttpStatusCodes.NOT_FOUND, Errors.EQUIPMENT_NOT_FOUND, "NOT_FOUND")
}

function getAll(): Promise<IEquipment[]> {
	return EquipmentRepo.getAll();
}

function addOne(equipment: IEquipment): Promise<void> {
	return EquipmentRepo.add(equipment);
}

function getOne(id: string): Promise<IEquipment | null> {
	return EquipmentRepo.getOne(id);
}

async function updateOne(id: string, equipment: IEquipmentPatch): Promise<void> {
	const persists = await EquipmentRepo.persists(id);
	if (!persists) throw generateNotFoundError();
	return EquipmentRepo.updateOne(id, equipment);
}

async function deleteOne(id: string): Promise<void> {
	const persists = await EquipmentRepo.persists(id);
	if (!persists) throw generateNotFoundError();
	return EquipmentRepo.delete(id);
}

async function getEquipmentRequests(id: string): 
Promise<IMaintenanceRequest[]> {
	const persists = await EquipmentRepo.persists(id);
	if (!persists) throw generateNotFoundError();
	return RequestRepo.getAllRequestsByEqipmentId(id);
}

// TODO: connect external service from case1
// https://github.com/nhassl3/greenatom_case-1
async function getEquipmentWeather(id: string): Promise<IEquipment | null> {
	const persists = await EquipmentRepo.persists(id);
	if (!persists) throw generateNotFoundError();
	return EquipmentRepo.getOne(id); // ????
}

export default {
	getAll,
	addOne,
	getOne,
	updateOne,
	deleteOne,
	getEquipmentRequests,
	getEquipmentWeather,
} as const