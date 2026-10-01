import { sequelize } from '@src/db/models'
import { QueryTypes } from 'sequelize'
import { TxOpts } from './common/tx'
import { EquipmentLoadQuery, EquipmentLoadRow, IReportRepo, ListResult } from './types'

// Белый список сортировки: apiField -> SQL-выражение. Пользовательский ввод в SQL не попадает.
const SORT_SQL: Record<string, string> = {
	name: 'agg.name',
	requestsTotal: 'requests_total',
	requestsClosed: 'requests_closed',
	plannedHoursTotal: 'planned_hours_total',
	lastServiceAt: 'last_service_at',
};

function orderBy(sort?: string): string {
	const desc = !!sort?.startsWith('-');
	const sql = SORT_SQL[desc ? sort!.slice(1) : sort ?? ''] ?? 'requests_total';
	return `${sql} ${desc || !sort ? 'DESC' : 'ASC'} NULLS LAST, agg.id ASC`;
}

interface Row {
	id: string;
	name: string;
	serial_number: string;
	site_code: string | null;
	requests_total: string;
	requests_closed: string;
	planned_hours_total: string;
	last_service_at: Date | null;
	total: string;
}

/**
 * Загрузка оборудования за период. CTE hours/closed агрегируют заранее, поэтому JOIN не размножает строки заявок.
 */
async function equipmentLoad(q: EquipmentLoadQuery, opts?: TxOpts): Promise<ListResult<EquipmentLoadRow>> {
	const rows = await sequelize.query<Row>(`
		WITH hours AS (
			SELECT request_id, SUM(planned_hours) AS h FROM request_assignees GROUP BY request_id
		), closed AS (
			SELECT request_id, MAX(changed_at) AS closed_at FROM request_status_history
			WHERE new_status = 'done' GROUP BY request_id
		), agg AS (
			SELECT e.id, e.name, e.serial_number, s.code AS site_code,
			       COUNT(r.id) AS requests_total,
			       COUNT(r.id) FILTER (WHERE r.status = 'done') AS requests_closed,
			       COALESCE(SUM(hours.h), 0) AS planned_hours_total,
			       MAX(closed.closed_at) AS last_service_at
			FROM equipment e
			LEFT JOIN sites s ON s.id = e.site_id
			LEFT JOIN maintenance_requests r ON r.equipment_id = e.id AND r.deleted_at IS NULL
			       AND r.created_at >= :from AND r.created_at < :to
			LEFT JOIN hours  ON hours.request_id = r.id
			LEFT JOIN closed ON closed.request_id = r.id
			WHERE e.deleted_at IS NULL
			GROUP BY e.id, s.code
			HAVING COUNT(r.id) >= :minRequests
		)
		SELECT agg.*, COUNT(*) OVER () AS total
		FROM agg
		ORDER BY ${orderBy(q.sort)}
		LIMIT :limit OFFSET :offset
	`, {
		replacements: { from: q.from, to: q.to, minRequests: q.minRequests, limit: q.limit, offset: q.offset },
		type: QueryTypes.SELECT,
		transaction: opts?.tx,
	});
	return {
		total: rows.length ? Number(rows[0].total) : 0,
		items: rows.map((r) => ({
			id: r.id,
			name: r.name,
			serialNumber: r.serial_number,
			siteCode: r.site_code,
			requestsTotal: Number(r.requests_total),
			requestsClosed: Number(r.requests_closed),
			plannedHoursTotal: Number(r.planned_hours_total),
			lastServiceAt: r.last_service_at,
		})),
	};
}

const ReportRepo: IReportRepo = { equipmentLoad };

export default ReportRepo;
