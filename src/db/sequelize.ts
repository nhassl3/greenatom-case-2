import { Sequelize } from 'sequelize'
import DbEnv from './config'

// Единственный экземпляр Sequelize (и пул соединений) на всё приложение.
const sequelize = new Sequelize({
	dialect: 'postgres',
	host: DbEnv.DbHost,
	port: DbEnv.DbPort,
	database: DbEnv.DbName,
	username: DbEnv.DbUser,
	password: DbEnv.DbPassword,
	pool: {
		max: DbEnv.DbPoolMax,
		min: DbEnv.DbPoolMin,
		idle: DbEnv.DbPoolIdleMs,
		acquire: DbEnv.DbPoolAcquireMs,
	},
	logging: false,
	define: { underscored: true },
});

export default sequelize;
