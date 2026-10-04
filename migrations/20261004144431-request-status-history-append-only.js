'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION request_status_history_append_only()
        RETURNS trigger
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RAISE EXCEPTION 'request_status_history is append-only: % is not allowed', TG_OP
            USING ERRCODE = 'restrict_violation';
        END;
        $$;
      `, { transaction });

      await queryInterface.sequelize.query(`
        CREATE TRIGGER request_status_history_append_only_trg
          BEFORE UPDATE OR DELETE ON request_status_history
          FOR EACH ROW
          EXECUTE FUNCTION request_status_history_append_only();
      `, { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'DROP TRIGGER IF EXISTS request_status_history_append_only_trg ON request_status_history;',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'DROP FUNCTION IF EXISTS request_status_history_append_only();',
        { transaction },
      );
    });
  },
};
