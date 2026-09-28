import app from './app'
import EnvVars, { IsProduction } from './common/constants/env'
import logger from './common/utils/logger'

const server = app.listen(EnvVars.Port, (err) => {
  if (err) { logger.err(err.message); process.exit(1); }
  logger.info(`Express server started on port: ${EnvVars.Port} (${EnvVars.NodeEnv})`);
  if (IsProduction && !EnvVars.ApiKey) {
    logger.warn('API_KEY не задан: изменяющие запросы доступны без аутентификации');
  }
});

process.on('unhandledRejection', (reason) => logger.err(`unhandledRejection: ${String(reason)}`));
process.on('uncaughtException', (err) => { logger.err(err, true); process.exit(1); });

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
