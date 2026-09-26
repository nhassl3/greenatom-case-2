import Equipment, { IEquipment, IEquipmentPatch } from '@src/models/Equipment.model'
import EquipmentService from '@src/services/EquipmentService'
import { getValidated, Req, Res } from './common/express-types'
import { created, ok, okE } from './common/respond'

// Functions

/**
 * Список оборудования: фильтры,
сортировка, пагинация
 * 
 * @param _ request
 * @param res response
 * @route GET /api/equipment
 */
async function get(_: Req, res: Res) {
	const equipements = await EquipmentService.getAll();
	ok(res, equipements);
}

/**
 * Создание единицы оборудования
 *
 * @route POST /api/equipment
 */
async function add(req: Req, res: Res) {
	const { body } = getValidated<unknown, unknown, IEquipment>(res);
	await EquipmentService.addOne(Equipment.new(body));
	created(res, req.originalUrl, {"status": "created"});
}

/**
 * Карточка оборудования
 *
 * @route GET /api/equipment/:id
 */
async function getById(_: Req, res: Res) {
  const { params } = getValidated<{id: string}, unknown, unknown>(res);
  const equipment = await EquipmentService.getOne(params.id);
  ok(res, equipment);
}

/**
 * Частичное обновление
 *
 * @route PATCH /api/equipment/:id
 */
async function patch(_: Req, res: Res) {
	const { params, body } = getValidated<{id: string}, unknown, IEquipmentPatch>(res);
  await EquipmentService.updateOne(params.id, body);
  okE(res);
}

/**
 * Удаление (запрещено при наличии
открытых заявок)
 *
 * @route DELETE /api/equipment/:id
 */
async function delete_(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, unknown, unknown>(res);
  await EquipmentService.deleteOne(params.id);
  okE(res);
}

/**
 * Заявки по конкретной единице
оборудования
 * @param req request
 * @param res response
 * @route /api/equipment/:id/requests
 */
async function getRequest(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, unknown, unknown>(res);
	const equipmentRequests = await EquipmentService.getEquipmentRequests(params.id);
	ok(res, equipmentRequests);
}

/**
 * Прогноз по координатам объекта и
пригодность окна для наружных работ
 * @param req request
 * @param res response
 * @route /api/equipment/:id/weather
 */
async function getWeather(req: Req, res: Res) {
	const { params } = getValidated<{id: string}, unknown, unknown>(res);
	const equipmentWeather = await EquipmentService.getEquipmentWeather(params.id);
	ok(res, equipmentWeather);
}

// export default

export default {
	get,
	add,
	getById,
	patch,
	delete: delete_,
	getRequest,
	getWeather
} as const;