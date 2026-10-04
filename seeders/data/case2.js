'use strict';

const fs = require('fs');
const path = require('path');
const { buildCrew, buildHistory, HOUR } = require('./lib');
const { sites, technicians } = require('./reference');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'case2-export.json'), 'utf8'));

// Площадка по региону: ближайшая по координатам
const nearestSite = ({ lat, lon }) =>
	sites.reduce((best, s) => ((s.lat - lat) ** 2 + (s.lon - lon) ** 2 < (best.lat - lat) ** 2 + (best.lon - lon) ** 2 ? s : best)).id;

const equipment = raw.equipments.map((e) => ({
	id: e.id,
	site_id: nearestSite(e.location),
	name: e.name,
	type: e.type,
	serial_number: e.serialNumber,
	lat: e.location.lat,
	lon: e.location.lon,
	status: e.status,
	installed_at: new Date(e.installedAt),
	created_at: new Date(e.installedAt),
	updated_at: new Date(e.installedAt),
}));

// Заявки без оборудования в экспорте (осиротевшие ссылки) перенести нельзя: FK equipment_id
const knownEquipment = new Set(raw.equipments.map((e) => e.id));
const orphans = raw.maintenances.filter((m) => !knownEquipment.has(m.equipmentId));
if (orphans.length) {
	console.warn(`[seed] case2: пропущено заявок без оборудования: ${orphans.length} (${orphans.map((m) => m.id).join(', ')})`);
}

const requests = raw.maintenances.filter((m) => knownEquipment.has(m.equipmentId)).map((m) => ({
	id: m.id,
	equipment_id: m.equipmentId,
	title: m.title,
	description: m.description ?? null,
	priority: m.priority,
	status: m.status,
	planned_at: m.plannedAt ? new Date(m.plannedAt) : null,
	author: m.author ?? null,
	created_at: new Date(m.createdAt),
	updated_at: new Date(m.updatedAt),
}));

const history = requests.flatMap((r) => buildHistory({
	id: r.id, status: r.status, author: r.author, createdAt: r.created_at, updatedAt: r.updated_at,
}));

// В работе и выполненные заявки обязаны иметь бригаду
const assignees = requests
	.filter((r) => r.status === 'in_progress' || r.status === 'done')
	.flatMap((r, i) => buildCrew(
		r.id,
		[technicians[i % technicians.length].id, technicians[(i + 2) % technicians.length].id],
		[4, 2],
		new Date(r.created_at.getTime() + HOUR),
	));

module.exports = { equipment, requests, history, assignees };
