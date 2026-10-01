import { Technician } from '@src/db/models'
import { ITechnician } from '@src/models/Technician.model'
import { map2ITechnician } from './common/map'
import { TxOpts } from './common/tx'
import { ITechnicianRepo } from './types'

/** Возвращает id найденных специалистов одним запросом (без дублей) */
async function findByIds(ids: string[], opts?: TxOpts): Promise<string[]> {
	if (ids.length === 0) return [];
	const rows = await Technician.findAll({ where: { id: [...new Set(ids)] }, attributes: ['id'], transaction: opts?.tx });
	return rows.map((t) => t.id);
}

async function findById(id: string, opts?: TxOpts): Promise<ITechnician | null> {
	const t = await Technician.findByPk(id, { transaction: opts?.tx });
	return t ? map2ITechnician(t) : null;
}

const TechnicianRepo: ITechnicianRepo = { findByIds, findById };

export default TechnicianRepo;
