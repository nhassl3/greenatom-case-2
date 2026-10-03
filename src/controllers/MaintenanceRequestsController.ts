import Paths from '@src/common/constants/Paths'
import { AssigneeItem, RequestListQuery } from '@src/common/utils/requests.validators'
import { RequestCreateDto, RequestPatchDto } from '@src/models/Maintenance.model'
import { RequestStatus } from '@src/models/common/general'
import RequestService from '@src/services/MaintenanceRequestService'
import { getValidated, type Req, type Res } from './common/express-types'
import * as respond from './common/respond'

// Functions

/**
 * Список заявок: фильтры, сортировка, пагинация
 *
 * @route GET /api/requests
 */
async function list(_: Req, res: Res) {
	const { query } = getValidated<never, RequestListQuery, never>(res);
	const { items, meta } = await RequestService.list(query);
	respond.list(res, items, meta);
}

/**
 * Создание заявки
 *
 * @route POST /api/requests
 */
async function create(_: Req, res: Res) {
	const { body } = getValidated<never, never, RequestCreateDto>(res);
	const created = await RequestService.create(body);
	// jet-paths не пропускает UUID (дефисы в сегменте), поэтому путь собирается вручную
	respond.created(res, `${Paths._}${Paths.Requests._}/${created.id}`, created);
}

/**
 * Карточка заявки
 *
 * @route GET /api/requests/:id
 */
async function getById(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, never, never>(res);
	respond.ok(res, await RequestService.getById(params.id));
}

/**
 * Редактирование полей заявки
 *
 * @route PATCH /api/requests/:id
 */
async function patch(_: Req, res: Res) {
	const { params, body } = getValidated<{id: string}, never, RequestPatchDto>(res);
	respond.ok(res, await RequestService.patch(params.id, body));
}

/**
 * Смена статуса заявки с проверкой допустимости перехода (см. AllowedStatusTransitions в сервисе)
 *
 * @route PATCH /api/requests/:id/status
 */
async function patchStatus(_: Req, res: Res) {
	const { params, body } = getValidated<{id: string}, never, { status: RequestStatus }>(res);
	respond.ok(res, await RequestService.changeStatus(params.id, body.status));
}

/**
 * Удаление заявки
 *
 * @route DELETE /api/requests/:id
 */
async function remove(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, never, never>(res);
	await RequestService.remove(params.id);
	respond.noContent(res);
}

/**
 * Пакетное создание заявок, 207 с результатом по каждой позиции
 *
 * @route POST /api/requests/bulk
 */
async function bulk(_: Req, res: Res) {
	const { body } = getValidated<never, never, { items: unknown[] }>(res);
	respond.multiStatus(res, await RequestService.createBulk(body.items));
}

/**
 * Замена бригады заявки
 *
 * @route POST /api/requests/:id/assignees
 */
async function assign(_: Req, res: Res) {
	const { params, body } = getValidated<{id: string}, never, { assignees: AssigneeItem[] }>(res);
	const request = await RequestService.assignCrew(params.id, body.assignees);
	respond.created(res, `${Paths._}${Paths.Requests._}/${params.id}`, request);
}

/**
 * Снятие специалиста с заявки
 *
 * @route DELETE /api/requests/:id/assignees/:userId
 */
async function unassign(_: Req, res: Res) {
	const { params } = getValidated<{id: string; userId: string}, never, never>(res);
	await RequestService.unassign(params.id, params.userId);
	respond.noContent(res);
}

/**
 * Журнал смены статусов заявки
 *
 * @route GET /api/requests/:id/history
 */
async function history(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, never, never>(res);
	respond.ok(res, await RequestService.getHistory(params.id));
}

export default {
	bulk,
	assign,
	unassign,
	history,
	list,
	create,
	getById,
	patch,
	patchStatus,
	remove,
} as const;