import HttpStatusCodes from '@src/common/constants/HttpStatusCodes'
import Equipment from '@src/models/Equipment.model'
import EquipmentService from '@src/services/EquipmentService'
import { isString } from 'jet-validators'
import { transform } from 'jet-validators/utils'
import { Req, Res } from './common/express-types'
import parseReq from './common/parseReq'

// Constants

const reqValidators = {
	getOne: parseReq({ id: transform(String, isString) }),
	add: parseReq({ equipment: Equipment.isNew }),
	patch: parseReq({ equipment: Equipment.isPartial }),
	delete: parseReq({ id: transform(String, isString) }),
} as const;

// functions

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
	res.status(HttpStatusCodes.OK).json({ equipements });
}

/**
 * Создание единицы оборудования
 *
 * @route POST /api/equipment
 */
async function add(req: Req, res: Res) {
	const { equipment } = reqValidators.add(req.body);
	await EquipmentService.addOne(Equipment.new(equipment));
	res.status(HttpStatusCodes.CREATED).end();
}

/**
 * Карточка оборудования
 *
 * @route GET /api/equipment/:id
 */
async function getById(req: Req, res: Res) {
  const { id } = reqValidators.getOne(req.params);
  const equipment = await EquipmentService.getOne(id);
  res.status(HttpStatusCodes.OK).json({ equipment });
}

/**
 * Частичное обновление
 *
 * @route PATCH /api/equipment/:id
 */
async function patch(req: Req, res: Res) {
  const { id } = reqValidators.getOne(req.params);
	const { equipment } = reqValidators.patch(req.body);
  await EquipmentService.updateOne(id, equipment);
  res.status(HttpStatusCodes.OK).end();
}

/**
 * Удаление (запрещено при наличии
открытых заявок)
 *
 * @route DELETE /api/equipment/:id
 */
async function delete_(req: Req, res: Res) {
  const { id } = reqValidators.delete(req.params);
  await EquipmentService.deleteOne(id);
  res.status(HttpStatusCodes.OK).end();
}

/**
 * Заявки по конкретной единице
оборудования
 * @param req request
 * @param res response
 * @route /api/equipment/:id/requests
 */
async function getRequest(req: Req, res: Res) {
	const { id } = reqValidators.getOne(req.params);
	const equipmentRequests = await EquipmentService.getEquipmentRequests(id);
	res.status(HttpStatusCodes.OK).json({ equipmentRequests});
}

/**
 * Прогноз по координатам объекта и
пригодность окна для наружных работ
 * @param req request
 * @param res response
 * @route /api/equipment/:id/weather
 */
async function getWeather(req: Req, res: Res) {
	const { id } = reqValidators.getOne(req.params);
	const equipmentWeather = await EquipmentService.getEquipmentWeather(id);
	res.status(HttpStatusCodes.OK).json({ equipmentWeather });
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