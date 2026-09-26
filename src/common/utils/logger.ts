import EnvVars, { IsProduction, NodeEnvs } from '@src/common/constants/env'
import { JetLogger, jetLogger } from 'jet-logger'

const logger = jetLogger({
	mode: EnvVars.NodeEnv === NodeEnvs.TEST ? JetLogger.Modes.OFF : JetLogger.Modes.CONSOLE,
	format: IsProduction ? JetLogger.Formats.JSON : JetLogger.Formats.LINE,
	timestamp: true,
});

export default logger;
