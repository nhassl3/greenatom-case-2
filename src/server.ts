import app from './app'
import EnvVars, { IsProduction } from './common/constants/env'
import logger from './common/utils/logger'
import DbEnv from './db/config'
import { sequelize } from './db/models'

async function start() {
  try {
    await sequelize.authenticate()
  } catch (err) {
    const reason = err instanceof Error ? (err.message || err.name) : String(err);
    logger.err(`Не удалось подключиться к БД ${DbEnv.DbHost}:${DbEnv.DbPort}/${DbEnv.DbName}: ${reason}`);
    process.exit(1);
  }
  logger.info('Database connection established');

  const server = app.listen(EnvVars.Port, (err) => {
    if (err) { logger.err(err.message); process.exit(1); }
    logger.info(`Express server started on port: ${EnvVars.Port} (${EnvVars.NodeEnv})`);
    if (IsProduction && !EnvVars.ApiKey) {
      logger.warn('API_KEY не задан: изменяющие запросы доступны без аутентификации');
    }
  });

  const shutdown = () => server.close(() => {
    void sequelize.close().finally(() => process.exit(0));
  }); // gracefull shutdown 
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

process.on('unhandledRejection', (reason) => logger.err(`unhandledRejection: ${String(reason)}`));
process.on('uncaughtException', (err) => { logger.err(err, true); process.exit(1); });

start().catch((err: Error) => {
  logger.err(`Startup failed: ${err.message}`);
  void sequelize.close().finally(() => process.exit(1));
});