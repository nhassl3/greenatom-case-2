'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        CREATE TYPE equipment_type AS ENUM ('turbine', 'inverter', 'sensor', 'substation');
        CREATE TYPE equipment_status AS ENUM ('operational', 'maintenance', 'fault', 'decommissioned');
      `, { transaction });

      await queryInterface.createTable('equipment', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        site_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'sites', key: 'id' },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
        name: { type: Sequelize.STRING(100), allowNull: false },
        type: { type: 'equipment_type', allowNull: false },
        serial_number: { type: Sequelize.STRING(64), allowNull: false, unique: true },
        status: { type: 'equipment_status', allowNull: false, defaultValue: 'operational' },
        installed_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      }, { transaction });

      await queryInterface.addIndex('equipment', ['site_id'], { name: 'equipment_site_id_idx', transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('equipment', { transaction });
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS equipment_status;
        DROP TYPE IF EXISTS equipment_type;
      `, { transaction });
    });
  },
};
