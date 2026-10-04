'use strict';

const { specializations, sites, technicians } = require('./data/reference');

/** Справочники: специализации (4), площадки (3), специалисты (6). */
module.exports = {
	async up(queryInterface) {
		await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.bulkInsert('specializations', specializations, { transaction });
			await queryInterface.bulkInsert('sites', sites, { transaction });
			await queryInterface.bulkInsert('technicians', technicians, { transaction });
		});
	},

	async down(queryInterface) {
		await queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.bulkDelete('technicians', { id: technicians.map((t) => t.id) }, { transaction });
			await queryInterface.bulkDelete('sites', { id: sites.map((s) => s.id) }, { transaction });
			await queryInterface.bulkDelete('specializations', { id: specializations.map((s) => s.id) }, { transaction });
		});
	},
};
