'use strict';

const { removeDataset } = require('./data/lib');
const { equipment, passports, requests, history, assignees } = require('./data/demo');

/** Демо-данные: +4 единицы оборудования, паспорта, 20 заявок во всех статусах. */
module.exports = {
	async up(queryInterface) {
		await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.bulkInsert('equipment', equipment, { transaction });
			await queryInterface.bulkInsert('equipment_passports', passports, { transaction });
			await queryInterface.bulkInsert('maintenance_requests', requests, { transaction });
			await queryInterface.bulkInsert('request_assignees', assignees, { transaction });
			await queryInterface.bulkInsert('request_status_history', history, { transaction });
		});
	},

	async down(queryInterface) {
		await queryInterface.sequelize.transaction(async (transaction) => {
			// паспорта case2-оборудования удаляем явно: само оборудование принадлежит сиду 02
			await queryInterface.bulkDelete('equipment_passports', { id: passports.map((p) => p.id) }, { transaction });
		});
		await removeDataset(queryInterface, {
			requestIds: requests.map((r) => r.id),
			equipmentIds: equipment.map((e) => e.id),
		});
	},
};
