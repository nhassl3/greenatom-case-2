'use strict';

const crypto = require('crypto');

/** Детерминированный UUID по имени: сиды и их down видят одни и те же id. */
const uid = (name) => {
	const h = crypto.createHash('md5').update(`greenatom-case3:${name}`).digest('hex').split('');
	h[12] = '4';
	h[16] = '89ab'[parseInt(h[16], 16) % 4];
	const s = h.join('');
	return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
};

const HOUR = 3600 * 1000;

/**
 * История статусов, согласованная с текущим статусом и датами заявки:
 * null → new (createdAt), new → in_progress (посередине), → done|rejected (updatedAt).
 */
const buildHistory = (r) => {
	const created = new Date(r.createdAt).getTime();
	const updated = Math.max(new Date(r.updatedAt).getTime(), created + 2 * HOUR);
	const mk = (suffix, oldStatus, newStatus, at, comment = null) => ({
		id: uid(`history:${r.id}:${suffix}`),
		request_id: r.id,
		old_status: oldStatus,
		new_status: newStatus,
		changed_by: r.author ?? null,
		comment,
		changed_at: new Date(at),
	});
	const rows = [mk('new', null, 'new', created)];
	if (r.status === 'in_progress' || r.status === 'done') {
		rows.push(mk('in_progress', 'new', 'in_progress', r.status === 'in_progress' ? updated : created + Math.floor((updated - created) / 2)));
	}
	if (r.status === 'done') rows.push(mk('done', 'in_progress', 'done', updated));
	if (r.status === 'rejected') rows.push(mk('rejected', 'new', 'rejected', updated));
	return rows;
};

/** Бригада: ровно один lead, остальные member. */
const buildCrew = (requestId, technicianIds, hours, at) =>
	technicianIds.map((technicianId, i) => ({
		request_id: requestId,
		technician_id: technicianId,
		role: i === 0 ? 'lead' : 'member',
		planned_hours: hours[i] ?? 2,
		created_at: at,
		updated_at: at,
	}));

/** Удаление строк журнала (append-only триггер) на время отката сидов. */
const deleteHistory = async (queryInterface, requestIds, transaction) => {
	const t = 'request_status_history';
	await queryInterface.sequelize.query(`ALTER TABLE ${t} DISABLE TRIGGER request_status_history_append_only_trg`, { transaction });
	await queryInterface.bulkDelete(t, { request_id: requestIds }, { transaction });
	await queryInterface.sequelize.query(`ALTER TABLE ${t} ENABLE TRIGGER request_status_history_append_only_trg`, { transaction });
};

/** Откат набора: журнал → бригады → заявки → оборудование (паспорта удаляются каскадом). */
const removeDataset = async (queryInterface, { requestIds, equipmentIds }) => {
	await queryInterface.sequelize.transaction(async (transaction) => {
		await deleteHistory(queryInterface, requestIds, transaction);
		await queryInterface.bulkDelete('request_assignees', { request_id: requestIds }, { transaction });
		await queryInterface.bulkDelete('maintenance_requests', { id: requestIds }, { transaction });
		await queryInterface.bulkDelete('equipment', { id: equipmentIds }, { transaction });
	});
};

module.exports = { uid, buildHistory, buildCrew, removeDataset, HOUR };
