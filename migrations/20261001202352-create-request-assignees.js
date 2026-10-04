'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        "CREATE TYPE assignee_role AS ENUM ('lead', 'member')",
        { transaction },
      );

      await queryInterface.createTable('request_assignees', {
        request_id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          references: { model: 'maintenance_requests', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        technician_id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          references: { model: 'technicians', key: 'id' },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
        role: { type: 'assignee_role', allowNull: false, defaultValue: 'member' },
        planned_hours: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      }, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE request_assignees
          ADD CONSTRAINT request_assignees_planned_hours_chk CHECK (planned_hours > 0)
      `, { transaction });

      await queryInterface.addIndex('request_assignees', ['request_id'], {
        name: 'request_assignees_one_lead_uq',
        unique: true,
        where: { role: 'lead' },
        transaction,
      }); // один руководитель на заявку

      await queryInterface.addIndex('request_assignees', ['technician_id'], {
        name: 'request_assignees_technician_id_idx',
        transaction,
      }); // PK начинается с request_id, поэтому для выборок по специалисту нужен свой индекс
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('request_assignees', { transaction });
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS assignee_role', { transaction });
    });
  },
};
