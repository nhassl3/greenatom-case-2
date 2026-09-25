import logger from 'jet-logger'

import server from './app'
import EnvVars from './common/constants/env'

/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MESSAGE =
  'Express server started on port: ' + EnvVars.Port.toString();

/******************************************************************************
                                  Run
******************************************************************************/

// Start the server
server.listen(EnvVars.Port, (err) => {
  if (!!err) {
    logger.err(err.message);
  } else {
    logger.info(SERVER_START_MESSAGE);
  }
});
