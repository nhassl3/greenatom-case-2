import { Equipment, MaintenanceRequest, sequelize, Site } from '@src/db/models'
import { col, fn, QueryTypes } from 'sequelize'
import { map2ISite } from './common/map'
import { TxOpts } from './common/tx'
import { ISiteRepo, SiteSummary } from './types'

async function findById(id: string, opts?: TxOpts) {
	const s = await Site.findByPk(id, { transaction: opts?.tx });
	return s ? map2ISite(s) : null;
}

async function countBy(siteId: string, field: 'status' | 'priority', opts?: TxOpts) {
	const rows = await MaintenanceRequest.findAll({
		attributes: [field, [fn('COUNT', col('MaintenanceRequest.id')), 'count']],
		include: [{ model: Equipment, as: 'equipment', attributes: [], required: true, where: { siteId } }],
		group: [`MaintenanceRequest.${field}`],
		order: [[field, 'ASC']],
		raw: true,
		transaction: opts?.tx,
	}) as unknown as Record<string, string>[];
	return rows.map((r) => ({ [field]: r[field], count: Number(r.count) }));
}

/** Сводка по заявкам площадки: количество по статусам и приоритетам, среднее время закрытия в часах */
async function getSummary(siteId: string, opts?: TxOpts): Promise<SiteSummary> {
	const [byStatus, byPriority, avg] = await Promise.all([
		countBy(siteId, 'status', opts),
		countBy(siteId, 'priority', opts),
		sequelize.query<{ avg_hours: string | null }>(`
			SELECT AVG(EXTRACT(EPOCH FROM (c.closed_at - r.created_at)) / 3600) AS avg_hours
			FROM maintenance_requests r
			JOIN equipment e ON e.id = r.equipment_id AND e.site_id = :siteId
			JOIN (SELECT request_id, MAX(changed_at) AS closed_at
			        FROM request_status_history WHERE new_status = 'done' GROUP BY request_id) c ON c.request_id = r.id
			WHERE r.deleted_at IS NULL AND r.status = 'done'
		`, { replacements: { siteId }, type: QueryTypes.SELECT, transaction: opts?.tx }),
	]);
	const hours = avg[0]?.avg_hours;
	return {
		siteId,
		byStatus: byStatus as SiteSummary['byStatus'],
		byPriority: byPriority as SiteSummary['byPriority'],
		avgCloseHours: hours == null ? null : Number(Number(hours).toFixed(2)),
	};
}

const SiteRepo: ISiteRepo = { findById, getSummary };

export default SiteRepo;
