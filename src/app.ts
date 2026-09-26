import type { Request, Response } from 'express'
import express from 'express'
import helmet from 'helmet'
import path from 'path'

import Paths from '@src/common/constants/Paths'
import BaseRouter from '@src/routes/apiRouter'

import cors from 'cors'
import EnvVars from './common/constants/env'
import { corsOptions } from './config/cors'
import { errorHandler } from './middlewares/errorHandler'
import { notFound } from './middlewares/notFound'
import { apiLimiter } from './middlewares/rateLimit'
import { requestId } from './middlewares/requestID'
import { requestLogger } from './middlewares/requestLogger'

/******************************************************************************
                                Setup
******************************************************************************/

const app = express();
app.set('trust proxy', 1); // docker

// **** Middleware **** //

// Basic middleware
app.use(requestId);
app.use(requestLogger);
app.use(helmet());
app.use(cors(corsOptions));
app.use(Paths._, apiLimiter);
app.use(notFound);
app.use(errorHandler);
app.use(express.json({limit: EnvVars.BodyLimit}));
app.use(express.urlencoded({ extended: true }));

// Add APIs, must be after middleware
app.use(Paths._, BaseRouter);

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
