import HttpStatusCodes from '@src/common/constants/HttpStatusCodes'
import Maintenance, { IMaintenanceRequest, IMaintenanceRequestPatch } from '@src/models/Maintenance.model'
import RequestService from '@src/services/MaintenanceRequestService'
import { getValidated, type Req, type Res } from './common/express-types'
import { created, ok, okE } from './common/respond'

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
	const {body} = getValidated<unknown, unknown, IMaintenanceRequest>(res);
	await RequestService.addOne(Maintenance.new(body));
	created(res, req.originalUrl, {"status": "created"});
}

/**
 * Карточка заявки
 * @param req request
 * @param res response
 * @route GET /api/requests/:id
 */
async function getById(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, unknown, unknown>(res);
	const request = await RequestService.getById(params.id);
	ok(res, request);
}

/**
 * Редактирование полей заявки
 * @param req request
 * @param res response
 * @route PATCH /api/reqeusts/:id
 */
async function patch(_: Req, res: Res) {
	const { params, body } = getValidated<{id: string}, unknown, IMaintenanceRequestPatch>(res);
	await RequestService.patchOne(params.id, body)
	okE(res);
}

/**
 * Смена статуса заявки с проверкой допустимости перехода (см. в @src/models/Maintenance.model.ts)
 * @param req request
 * @param res response
 * @route PATCH /api/requests/:id/status
 */
async function patchStatus(_: Req, res: Res) {
	const { params, body } = getValidated<{id: string}, unknown, {status: string}>(res);
	await RequestService.patchStatus(params.id, body.status);
	okE(res);
}

/**
 * Удаление заявки
 * @param req request
 * @param res response
 * @route DELETE /api/requests/:id
 */
async function delete_(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, unknown, unknown>(res);
	await RequestService.deleteOne(params.id);
	okE(res);
}

export default {
	get,
	add,
	getById,
	patch,
	patchStatus,
	delete: delete_,
} as const;