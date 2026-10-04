'use strict';

/**
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('equipment', 'lat', { type: Sequelize.DECIMAL(9, 6), allowNull: true }, { transaction });
      await queryInterface.addColumn('equipment', 'lon', { type: Sequelize.DECIMAL(9, 6), allowNull: true }, { transaction });
      await queryInterface.sequelize.query(`
        UPDATE equipment e SET lat = s.lat, lon = s.lon FROM sites s WHERE s.id = e.site_id;
      `, { transaction });
      await queryInterface.sequelize.query(`
        ALTER TABLE equipment
          ALTER COLUMN lat SET NOT NULL,
          ALTER COLUMN lon SET NOT NULL,
          ADD CONSTRAINT equipment_lat_range_chk CHECK (lat BETWEEN -90 AND 90),
          ADD CONSTRAINT equipment_lon_range_chk CHECK (lon BETWEEN -180 AND 180);
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE equipment DROP CONSTRAINT equipment_serial_number_key;
        CREATE UNIQUE INDEX equipment_serial_number_active_uq ON equipment (lower(serial_number)) WHERE deleted_at IS NULL;
      `, { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS equipment_serial_number_active_uq;
        ALTER TABLE equipment ADD CONSTRAINT equipment_serial_number_key UNIQUE (serial_number);
        ALTER TABLE equipment
          DROP CONSTRAINT IF EXISTS equipment_lat_range_chk,
          DROP CONSTRAINT IF EXISTS equipment_lon_range_chk,
          DROP COLUMN IF EXISTS lat,
          DROP COLUMN IF EXISTS lon;
      `, { transaction });
    });
  },
};
