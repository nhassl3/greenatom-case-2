'use strict';

const { removeDataset } = require('./data/lib');
const { equipment, requests, history, assignees } = require('./data/case2');

/** Перенос данных Кейса 2 (seeders/data/case2-export.json) с сохранением id. */
module.exports = {
	async up(queryInterface) {
		await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.bulkInsert('equipment', equipment, { transaction });
			await queryInterface.bulkInsert('maintenance_requests', requests, { transaction });
			await queryInterface.bulkInsert('request_assignees', assignees, { transaction });
			await queryInterface.bulkInsert('request_status_history', history, { transaction });
		});
	},

	async down(queryInterface) {
		await removeDataset(queryInterface, {
			requestIds: requests.map((r) => r.id),
			equipmentIds: equipment.map((e) => e.id),
		});
	},
};
