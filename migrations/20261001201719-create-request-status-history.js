'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable('request_status_history', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        request_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'maintenance_requests', key: 'id' },
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT',
        },
        old_status: { type: 'request_status', allowNull: true },
        new_status: { type: 'request_status', allowNull: false },
        changed_by: { type: Sequelize.STRING(120), allowNull: true },
        comment: { type: Sequelize.TEXT, allowNull: true },
        changed_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      }, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE request_status_history
          ADD CONSTRAINT request_status_history_status_changed_chk CHECK (old_status IS DISTINCT FROM new_status);
      `, { transaction });

      await queryInterface.addIndex('request_status_history', ['request_id', 'changed_at'], {
        name: 'request_status_history_request_id_changed_at_idx',
        transaction,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('request_status_history', { transaction });
      await queryInterface.sequelize.query(
        'DROP FUNCTION IF EXISTS request_status_history_forbid_change()',
        { transaction },
      );
    });
  },
};
