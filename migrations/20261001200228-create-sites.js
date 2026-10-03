'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable('sites', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        name: { type: Sequelize.STRING(120), allowNull: false },
        code: { type: Sequelize.STRING(32), allowNull: false, unique: true },
        region: { type: Sequelize.STRING(120), allowNull: false },
        lat: { type: Sequelize.DECIMAL(9, 6), allowNull: false },
        lon: { type: Sequelize.DECIMAL(9, 6), allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      }, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE sites
          ADD CONSTRAINT sites_lat_range_chk CHECK (lat BETWEEN -90 AND 90),
          ADD CONSTRAINT sites_lon_range_chk CHECK (lon BETWEEN -180 AND 180)
      `, { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sites');
  },
};
