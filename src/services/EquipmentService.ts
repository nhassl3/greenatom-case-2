import { ConflictError, NotFoundError } from '@src/common/errors'
import { EquipmentListQuery } from '@src/common/utils/equipment.validators'
import { RequestListQuery } from '@src/common/utils/requests.validators'
import { OPEN_REQUEST_STATUSES } from '@src/common/utils/validators'
import Equipment, { EquipmentCreateDto, EquipmentPatchDto, IEquipment } from '@src/models/Equipment.model'
import EquipmentRepo from '@src/repos/EquipmentRepo'
import RequestRepo from '@src/repos/MaintenanceRequestRepo'
import MaintenanceRequestService, { DEFAULT_LIMIT, DEFAULT_PAGE } from './MaintenanceRequestService'
import WeatherService from './WeatherService'

// Constants

export const Errors = {
	EQUIPMENT_NOT_FOUND: { code: 'EQUIPMENT_NOT_FOUND', message: 'Оборудование не найдено' },
	SERIAL_NUMBER_TAKEN: { code: 'SERIAL_NUMBER_TAKEN' },
	EQUIPMENT_HAS_OPEN_REQUESTS: { code: 'EQUIPMENT_HAS_OPEN_REQUESTS' },
} as const;

// Functions

const serialTaken = (serial: string) =>
	new ConflictError(`Серийный номер ${serial} уже занят`, Errors.SERIAL_NUMBER_TAKEN.code);

async function list(query: EquipmentListQuery) {
	const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sort, ...filter } = query;
	const { items, total } = await EquipmentRepo.findMany({ filter, sort, page, limit });
	return { items, meta: { total, page, limit } };
}

async function getById(id: string): Promise<IEquipment> {
	const equipment = await EquipmentRepo.findById(id);
	if (!equipment) throw new NotFoundError(Errors.EQUIPMENT_NOT_FOUND.message, Errors.EQUIPMENT_NOT_FOUND.code);
	return equipment;
}

/**
 * serialNumber уникален без учёта регистра, иначе 409.
 */
async function create(dto: EquipmentCreateDto): Promise<IEquipment> {
	if (await EquipmentRepo.findBySerialNumber(dto.serialNumber)) throw serialTaken(dto.serialNumber);
	return EquipmentRepo.create(Equipment.new(dto));
}

async function update(id: string, dto: EquipmentPatchDto): Promise<IEquipment> {
	await getById(id);
	if (dto.serialNumber) {
		const owner = await EquipmentRepo.findBySerialNumber(dto.serialNumber);
		if (owner && owner.id !== id) throw serialTaken(dto.serialNumber);
	}
	const { installedAt, ...rest } = dto;
	const updated = await EquipmentRepo.update(id, {
		...rest,
		...(installedAt ? { installedAt: installedAt.toISOString() } : {}),
	});
	return updated!;
}

/**
 * Удаление запрещено, пока у оборудования есть открытые заявки (new, in_progress).
 */
async function remove(id: string): Promise<void> {
	await getById(id);
	const open = await RequestRepo.countByEquipmentAndStatuses(id, OPEN_REQUEST_STATUSES);
	if (open > 0) {
		throw new ConflictError(
			`Нельзя удалить оборудование: открытых заявок — ${open}`,
			Errors.EQUIPMENT_HAS_OPEN_REQUESTS.code,
		);
	}
	await EquipmentRepo.delete(id);
}

async function listRequests(id: string, query: Omit<RequestListQuery, 'equipmentId'>) {
	await getById(id);
	return MaintenanceRequestService.list({ ...query, equipmentId: id });
}

async function getWeather(id: string) {
	const equipment = await getById(id);
	const forecast = await WeatherService.getOutdoorWorkForecast(equipment.location);
	return { equipmentId: equipment.id, location: equipment.location, ...forecast };
}

export default {
	list,
	getById,
	create,
	update,
	remove,
	listRequests,
	getWeather,
} as const;
