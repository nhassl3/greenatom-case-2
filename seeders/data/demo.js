'use strict';

const { buildCrew, buildHistory, uid, HOUR } = require('./lib');
const { sites, technicians } = require('./reference');
const case2 = require('./case2');

const DAY = 24 * HOUR;

const EQUIPMENT_DEF = [
	['Wind Turbine A1', 'turbine', 'WT-A1-0101', 0, 'operational', 'Vestas', 'V90-2.0', 2000],
	['Wind Turbine A2', 'turbine', 'WT-A2-0102', 0, 'maintenance', 'Siemens Gamesa', 'SG 2.1-114', 2100],
	['Solar Inverter S1', 'inverter', 'INV-S1-0201', 1, 'operational', 'Huawei', 'SUN2000-100KTL', 100],
	['Substation K1', 'substation', 'SUB-K1-0301', 2, 'fault', 'ABB', 'UniGear ZS1', 6300],
];

const equipment = EQUIPMENT_DEF.map(([name, type, serial, siteIdx, status, , , i], n) => ({
	id: uid(`eq:${serial}`),
	site_id: sites[siteIdx].id,
	name, type, serial_number: serial, lat: sites[siteIdx].lat + 0.01 * (n + 1), lon: sites[siteIdx].lon - 0.01 * (n + 1),
	status,
	installed_at: new Date('2025-03-01T09:00:00Z'),
	created_at: new Date('2025-03-01T09:00:00Z'),
	updated_at: new Date('2025-03-01T09:00:00Z'),
	_power: i,
}));

// Паспорта: у новых единиц и у двух единиц из Кейса 2
const passports = [
	...EQUIPMENT_DEF.map(([, , serial, , , manufacturer, model, power]) => ({
		id: uid(`passport:${serial}`),
		equipment_id: uid(`eq:${serial}`),
		manufacturer, model, nominal_power: power,
		last_verification_date: '2026-05-15',
		created_at: new Date('2025-03-01T09:00:00Z'), updated_at: new Date('2025-03-01T09:00:00Z'),
	})),
	...case2.equipment.slice(0, 2).map((e, i) => ({
		id: uid(`passport:${e.id}`),
		equipment_id: e.id,
		manufacturer: i === 0 ? 'SMA' : 'Bosch', model: i === 0 ? 'Sunny Tripower' : 'CISS', nominal_power: i === 0 ? 50 : 0.5,
		last_verification_date: '2026-02-10',
		created_at: new Date(e.installed_at), updated_at: new Date(e.installed_at),
	})),
];
equipment.forEach((e) => delete e._power);

const allEquipmentIds = [...case2.equipment.map((e) => e.id), ...equipment.map((e) => e.id)];
const STATUS_CYCLE = ['new', 'in_progress', 'done', 'rejected', 'done', 'new', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const TITLES = [
	'Плановое ТО', 'Замена подшипника', 'Диагностика вибрации', 'Проверка заземления', 'Калибровка датчиков',
	'Замена предохранителей', 'Осмотр лопастей', 'Чистка радиаторов охлаждения', 'Обновление прошивки', 'Проверка изоляции',
];

const requests = Array.from({ length: 20 }, (_, i) => {
	const createdAt = new Date('2026-06-01T08:00:00Z').getTime() + i * 4 * DAY;
	const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
	const updatedAt = status === 'new' ? createdAt : createdAt + (1 + (i % 4)) * DAY;
	return {
		id: uid(`req:demo:${i}`),
		equipment_id: allEquipmentIds[i % allEquipmentIds.length],
		title: `${TITLES[i % TITLES.length]} №${i + 1}`,
		description: i % 3 === 0 ? null : `Демо-заявка ${i + 1}`,
		priority: PRIORITIES[i % PRIORITIES.length],
		status,
		planned_at: i % 5 === 4 ? null : new Date(createdAt + 7 * DAY),
		author: 'seed',
		created_at: new Date(createdAt),
		updated_at: new Date(updatedAt),
	};
});

const history = requests.flatMap((r) => buildHistory({
	id: r.id, status: r.status, author: r.author, createdAt: r.created_at, updatedAt: r.updated_at,
}));

// in_progress и done: бригада из 1–3 специалистов с одним lead
const assignees = requests
	.filter((r) => r.status === 'in_progress' || r.status === 'done')
	.flatMap((r, i) => {
		const size = 1 + (i % 3);
		const crew = Array.from({ length: size }, (_, k) => technicians[(i + k) % technicians.length].id);
		return buildCrew(r.id, crew, [8, 4, 2], new Date(r.created_at.getTime() + HOUR));
	});

module.exports = { equipment, passports, requests, history, assignees };
