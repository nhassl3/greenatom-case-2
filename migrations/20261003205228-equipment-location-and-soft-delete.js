'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('equipment', 'lat', {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      });
      await queryInterface.addColumn('equipment', 'lon', {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      });
      await queryInterface.sequelize.query(`
        ALTER TABLE sites
          ADD CONSTRAINT equipment_lat_range_chk CHECK (lat BETWEEN -90 AND 90),
          ADD CONSTRAINT equipment_lon_range_chk CHECK (lon BETWEEN -180 AND 180);
      `, { transaction });
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "ALTER TABLE IF EXISTS equipment DROP COLUMN IF EXISTS lat, DROP COLUMN IF EXISTS lon;"
    );
  }
};
