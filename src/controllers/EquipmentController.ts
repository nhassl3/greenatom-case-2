import Paths from '@src/common/constants/Paths'
import { EquipmentListQuery } from '@src/common/utils/equipment.validators'
import { RequestListQuery } from '@src/common/utils/requests.validators'
import { EquipmentCreateDto, EquipmentPatchDto } from '@src/models/Equipment.model'
import EquipmentService from '@src/services/EquipmentService'
import { getValidated, Req, Res } from './common/express-types'
import * as respond from './common/respond'


// Functions

/**
 * Список оборудования: фильтры,сортировка, пагинация
 * @param _ request
 * @param res response
 * @route GET /api/equipment
 */
async function list(_: Req, res: Res) {
	const { query } = getValidated<never, EquipmentListQuery, never>(res);
	const { items, meta } = await EquipmentService.list(query);
	respond.list(res, items, meta);
}

/**
 * Создание единицы оборудования
 *
 * @route POST /api/equipment
 */
async function create(_: Req, res: Res) {
	const { body } = getValidated<never, never, EquipmentCreateDto>(res);
	const created = await EquipmentService.create(body);
	respond.created(res, `${Paths._}${Paths.Equipment._}/${created.id}`, created);
}

/**
 * Карточка оборудования
 *
 * @route GET /api/equipment/:id
 */
async function getById(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, never, never>(res);
	respond.ok(res, await EquipmentService.getById(params.id));
}

/**
 * Частичное обновление
 *
 * @route PATCH /api/equipment/:id
 */
async function patch(_: Req, res: Res) {
	const { params, body } = getValidated<{id: string}, never, EquipmentPatchDto>(res);
	respond.ok(res, await EquipmentService.update(params.id, body));
}

/**
 * Удаление (запрещено при наличии открытых заявок)
 *
 * @route DELETE /api/equipment/:id
 */
async function remove(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, never, never>(res);
	await EquipmentService.remove(params.id);
	respond.noContent(res);
}

/**
 * Заявки по конкретной единице оборудования
 *
 * @route GET /api/equipment/:id/requests
 */
async function listRequests(_: Req, res: Res) {
	const { params, query } = getValidated<{id: string}, Omit<RequestListQuery, 'equipmentId'>, never>(res);
	const { items, meta } = await EquipmentService.listRequests(params.id, query);
	respond.list(res, items, meta);
}

/**
 * Прогноз по координатам объекта и пригодность окна для наружных работ
 *
 * @route GET /api/equipment/:id/weather
 */
async function getWeather(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, never, never>(res);
	respond.ok(res, await EquipmentService.getWeather(params.id));
}

// export default

export default {
	list,
	create,
	getById,
	patch,
	remove,
	listRequests,
	getWeather,
} as const;