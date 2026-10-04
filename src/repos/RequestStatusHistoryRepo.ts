import { RequestStatusHistory } from '@src/db/models'
import { IRequestStatusHistory } from '@src/models/RequestStatusHistory.model'
import { map2IHistory } from './common/map'
import { TxOpts } from './common/tx'
import { IRequestStatusHistoryRepo } from './types'

// Журнал append-only: методов update/delete нет намеренно (плюс триггер в БД)

async function append(entry: Parameters<IRequestStatusHistoryRepo['append']>[0], opts?: TxOpts): Promise<IRequestStatusHistory> {
	const created = await RequestStatusHistory.create({
		requestId: entry.requestId,
		oldStatus: entry.oldStatus,
		newStatus: entry.newStatus,
		changedBy: entry.changedBy,
		comment: entry.comment,
		...(entry.changedAt ? { changedAt: entry.changedAt } : {}),
	}, { transaction: opts?.tx });
	return map2IHistory(created);
}

async function findByRequest(requestId: string, opts?: TxOpts): Promise<IRequestStatusHistory[]> {
	const rows = await RequestStatusHistory.findAll({
		where: { requestId },
		order: [['changedAt', 'ASC'], ['id', 'ASC']],
		transaction: opts?.tx,
	});
	return rows.map(map2IHistory);
}

const RequestStatusHistoryRepo: IRequestStatusHistoryRepo = { append, findByRequest };

export default RequestStatusHistoryRepo;
