 import logger from 'jet-logger'
import app from './app'
import EnvVars from './common/constants/env'

 const server = app.listen(EnvVars.Port, (err) => {
   if (err) { logger.err(err.message); process.exit(1); }
   logger.info(`Express server started on port: ${EnvVars.Port} (${EnvVars.NodeEnv})`);
 });

 process.on('unhandledRejection', (reason) => logger.err(`unhandledRejection: ${String(reason)}`));
 process.on('uncaughtException', (err) => { logger.err(err, true); process.exit(1); });

 const shutdown = () => server.close(() => process.exit(0));
 process.on('SIGTERM', shutdown);
 process.on('SIGINT', shutdown);