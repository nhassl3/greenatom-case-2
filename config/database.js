const path = require('path');

const env = process.env.NODE_ENV || 'development';
require('dotenv').config({
  path: process.env.DOTENV_CONFIG_PATH || path.resolve(__dirname, `.env.${env}`),
  quiet: true,
});

const config = {
  dialect: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  migrationStorageTableName: 'sequelize_meta',
  seederStorage: 'sequelize',
  seederStorageTableName: 'sequelize_data',
  logging: false,
};

module.exports = { development: config, test: config, production: config };
