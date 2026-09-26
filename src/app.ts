import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import logger from 'jet-logger'
import morgan from 'morgan'
import path from 'path'

import Paths from '@src/common/constants/Paths'
import { RouteError } from '@src/common/utils/route-errors'
import BaseRouter from '@src/routes/apiRouter'

import cors from 'cors'
import EnvVars from './common/constants/env'
import { corsOptions } from './config/cors'
import { errorHandler } from './middlewares/errorHandler'
import { notFound } from './middlewares/notFound'
import { apiLimiter } from './middlewares/rateLimit'
import { requestId } from './middlewares/requestID'
import { requestLogger } from './middlewares/requestLogger'
import { validate } from './middlewares/validate'

/******************************************************************************
                                Setup
******************************************************************************/

const app = express();

// **** Middleware **** //

// Basic middleware
app.use(requestId);
app.use(requestLogger);
app.use(helmet());
app.use(cors(corsOptions));
app.use(Paths._, apiLimiter);
app.use(notFound);
app.use(validate);
app.use(errorHandler);
app.use(express.json({limit: EnvVars.BodyLimit}));
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.DEV) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.PRODUCTION) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use(Paths._, BaseRouter);

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (EnvVars.NodeEnv !== NodeEnvs.TEST.valueOf()) {
    logger.err(err, true);
  }
  if (err instanceof RouteError) {
    res.status(err.status).json(err.toResponseBody());
    return;
  }
  return next(err);
});

// **** FrontEnd Content **** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Nav to api health status by default
app.get('/', (_: Request, res: Response) => {
  return res.redirect('/api/health');
});

// Redirect to login if not logged in.
app.get('/users', (_: Request, res: Response) => {
  return res.sendFile('users.html', { root: viewsDir });
});

/******************************************************************************
                                Export default
******************************************************************************/

export default app;
