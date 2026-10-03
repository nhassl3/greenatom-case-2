'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable('equipment_passports', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        equipment_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true, // 1:1
          references: { model: 'equipment', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        manufacturer: { type: Sequelize.STRING(120), allowNull: false },
        model: { type: Sequelize.STRING(120), allowNull: false },
        nominal_power: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        last_verification_date: { type: Sequelize.DATEONLY, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      }, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE equipment_passports
          ADD CONSTRAINT equipment_passports_nominal_power_chk CHECK (nominal_power > 0)
      `, { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('equipment_passports');
  },
};
