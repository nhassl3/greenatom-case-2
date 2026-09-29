'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'critical');
        CREATE TYPE request_status AS ENUM ('new', 'in_progress', 'done', 'rejected');
      `, { transaction });

      await queryInterface.createTable('maintenance_requests', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        equipment_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'equipment', key: 'id' },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
        title: { type: Sequelize.STRING(120), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        priority: { type: 'request_priority', allowNull: false },
        status: { type: 'request_status', allowNull: false, defaultValue: 'new' },
        planned_at: { type: Sequelize.DATE, allowNull: true },
        author: { type: Sequelize.STRING(120), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      }, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE maintenance_requests
          ADD CONSTRAINT maintenance_requests_description_len_chk CHECK (char_length(description) <= 2000)
      `, { transaction }); // длина description < 2000 символов
      await queryInterface.addIndex('maintenance_requests', ['equipment_id'], {
        name: 'maintenance_requests_equipment_id_idx',
        transaction,
      });
      await queryInterface.addIndex('maintenance_requests', ['status'], {
        name: 'maintenance_requests_status_idx',
        transaction,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('maintenance_requests', { transaction });
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS request_status;
        DROP TYPE IF EXISTS request_priority;
      `, { transaction });
    });
  },
};
