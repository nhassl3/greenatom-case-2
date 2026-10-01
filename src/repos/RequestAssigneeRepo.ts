import { IsProduction } from '@src/common/constants/env'
import { RequestAssignee } from '@src/db/models'
import { IRequestAssignee } from '@src/models/RequestAssignee.model'
import { map2IRequestAssignee } from './common/map'
import { TxOpts } from './common/tx'
import { AssigneeInput, IRequestAssigneeRepo } from './types'

// Демонстрация отката: ошибка между destroy и bulkCreate (никогда в production)
// eslint-disable-next-line no-process-env
const FAIL_AFTER_DELETE = !IsProduction && process.env.FAIL_AFTER_ASSIGNEES_DELETE === 'true';

/** Полная замена бригады. Вызывать внутри транзакции, иначе между destroy и bulkCreate заявка останется без исполнителей */
async function replaceForRequest(requestId: string, items: AssigneeInput[], opts?: TxOpts): Promise<void> {
	await RequestAssignee.destroy({ where: { requestId }, transaction: opts?.tx });
	if (FAIL_AFTER_DELETE) {
		throw new Error('FAIL_AFTER_ASSIGNEES_DELETE: демонстрация отката транзакции');
	}
	await RequestAssignee.bulkCreate(
		items.map((i) => ({ requestId, technicianId: i.technicianId, role: i.role, plannedHours: i.plannedHours })),
		{ transaction: opts?.tx },
	);
}

async function remove(requestId: string, technicianId: string, opts?: TxOpts): Promise<boolean> {
	const affected = await RequestAssignee.destroy({ where: { requestId, technicianId }, transaction: opts?.tx });
	return affected > 0;
}

async function countByRequest(requestId: string, opts?: TxOpts): Promise<number> {
	return RequestAssignee.count({ where: { requestId }, transaction: opts?.tx });
}

async function findByRequest(requestId: string, opts?: TxOpts): Promise<IRequestAssignee[]> {
	const rows = await RequestAssignee.findAll({ where: { requestId }, order: [['createdAt', 'ASC'], ['technicianId', 'ASC']], transaction: opts?.tx });
	return rows.map(map2IRequestAssignee);
}

const RequestAssigneeRepo: IRequestAssigneeRepo = { replaceForRequest, remove, countByRequest, findByRequest };

export default RequestAssigneeRepo;
