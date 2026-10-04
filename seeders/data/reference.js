'use strict';

const { uid } = require('./lib');

const now = new Date();

const specializations = ['Электрик', 'Механик', 'Специалист КИПиА', 'Высоковольтный электромонтёр']
	.map((name) => ({ id: uid(`spec:${name}`), name, created_at: now, updated_at: now }));

const sites = [
	{ code: 'MSK-01', name: 'Центральная ветростанция', region: 'Московская область', lat: 55.75, lon: 37.62 },
	{ code: 'SPB-01', name: 'Северная солнечная станция', region: 'Ленинградская область', lat: 59.93, lon: 30.31 },
	{ code: 'KRD-01', name: 'Южная подстанция', region: 'Краснодарский край', lat: 45.04, lon: 38.98 },
].map((s) => ({ id: uid(`site:${s.code}`), ...s, created_at: now, updated_at: now }));

const technicians = [
	['Иванов Пётр Сергеевич', 0], ['Смирнова Анна Викторовна', 0], ['Кузнецов Олег Андреевич', 1],
	['Попов Дмитрий Игоревич', 1], ['Васильева Елена Павловна', 2], ['Морозов Артём Николаевич', 3],
].map(([fullName, spec], i) => ({
	id: uid(`tech:${i + 1}`),
	full_name: fullName,
	specialization_id: specializations[spec].id,
	employee_number: `EMP-${String(i + 1).padStart(4, '0')}`,
	created_at: now,
	updated_at: now,
}));

module.exports = { specializations, sites, technicians };
