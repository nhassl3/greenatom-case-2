import HttpStatusCodes from '@src/common/constants/HttpStatusCodes'
import { isMaintenanceStatus } from '@src/common/utils/validators'
import Maintenance from '@src/models/Maintenance.model'
import RequestService from '@src/services/MaintenanceRequestService'
import { isString } from 'jet-validators'
import { transform } from 'jet-validators/utils'
import type { Req, Res } from './common/express-types'
import parseReq from './common/parseReq'

// Constants

const reqValidators = {
	add: parseReq({ maintenance: Maintenance.isNew }),
	getOne: parseReq({ id: transform(String, isString)}),
	patch: parseReq({ maintenance: Maintenance.isPartial}),
	delete: parseReq({ id: transform(String, isString)}),
	patchStatus: parseReq({ status: isMaintenanceStatus}),
}

// Functions

/**
 * Список заявок: фильтры, сортировка,
пагинация
 * @param _ reqeuest
 * @param res response
 * @route GET /api/requests
 */
async function get(_: Req, res: Res) {
	const requests = await RequestService.getAll();
	res.status(HttpStatusCodes.OK).json({ requests });
}

/**
 * Создание карточки
 * @param req requests
 * @param res response
 * @route POST /api/requests
 */
async function add(req: Req, res: Res) {
	const { maintenance } = reqValidators.add(req.body);
	await RequestService.addOne(Maintenance.new(maintenance));
	res.status(HttpStatusCodes.CREATED).end();
}

/**
 * Карточка заявки
 * @param req request
 * @param res response
 * @route GET /api/requests/:id
 */
async function getById(req: Req, res: Res) {
	const { id } = reqValidators.getOne(req.params);
	const request = await RequestService.getById(id);
	res.status(HttpStatusCodes.OK).json({request});
}

/**
 * Редактирование полей заявки
 * @param req request
 * @param res response
 * @route PATCH /api/reqeusts/:id
 */
async function patch(req: Req, res: Res) {
	const { id } = reqValidators.getOne(req.params);
	const { maintenance } = reqValidators.patch(req.body);
	await RequestService.patchOne(id, maintenance)
	res.status(HttpStatusCodes.OK).end();
}

/**
 * Смена статуса заявки с проверкой допустимости перехода (см. в @src/models/Maintenance.model.ts)
 * @param req request
 * @param res response
 * @route PATCH /api/requests/:id/status
 */
async function patchStatus(req: Req, res: Res) {
	const { id } = reqValidators.getOne(req.params);
	const { status } = reqValidators.patchStatus(req.body);
	await RequestService.patchStatus(id, status);
	res.status(HttpStatusCodes.OK).end();
}

/**
 * Удаление заявки
 * @param req request
 * @param res response
 * @route DELETE /api/requests/:id
 */
async function delete_(req: Req, res: Res) {
	const { id } = reqValidators.delete(req.params);
	await RequestService.deleteOne(id);
	res.status(HttpStatusCodes.OK).end();
}

export default {
	get,
	add,
	getById,
	patch,
	patchStatus,
	delete: delete_,
} as const;