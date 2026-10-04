import { ValidationError } from '@src/common/errors'
import { EquipmentLoadParams } from '@src/common/utils/reports.validators'
import ReportRepo from '@src/repos/ReportRepo'

const DEFAULT_LIMIT = 20;

async function equipmentLoad(q: EquipmentLoadParams) {
	if (q.from >= q.to) throw new ValidationError([{ field: 'from', message: 'from должен быть раньше to' }], 400);
	const limit = q.limit ?? DEFAULT_LIMIT;
	const offset = q.offset ?? 0;
	const { items, total } = await ReportRepo.equipmentLoad({
		from: q.from, to: q.to, minRequests: q.minRequests ?? 0, sort: q.sort, limit, offset,
	});
	return { items, meta: { total, limit, offset } };
}

export default { equipmentLoad } as const;
