import type { Request, Response } from 'express'
import express from 'express'
import helmet from 'helmet'

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
app.set('trust proxy', 1); // docker: корректный req.ip для rate limit

// **** Middleware **** //

app.use(requestId);                                   // 1. id нужен логгеру и ответу на любую ошибку, включая битый JSON
app.use(requestLogger);                               // 2. пишет строку на 'finish': видит итоговый статус и длительность
app.use(helmet());                                    // 3. защитные заголовки на всех ответах
app.use(cors(corsOptions));                           // 4. до маршрутов, чтобы preflight OPTIONS отвечал сразу
app.use(Paths._, apiLimiter);                         // 5. лимит только на /api и до разбора тела
app.use(express.json({ limit: EnvVars.BodyLimit }));  // 6. JSON с лимитом размера → 413

// **** FrontEnd Content **** //

// Nav to api health status by default
app.get('/', (_: Request, res: Response) => {
  return res.redirect('/api/health');
});

// **** API **** //

app.use(Paths._, BaseRouter);                         // 7. маршруты; validate подключается внутри них
app.use(notFound);                                    // 8. всё, что не совпало → 404 в общем формате
app.use(errorHandler);                                // 9. последним: сюда стекаются все ошибки

/******************************************************************************
                                Export default
******************************************************************************/

export default app;
