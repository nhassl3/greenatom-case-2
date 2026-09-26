import logger from '@src/common/logger/logger'
import type { Request, Response } from 'express'
import { NextFunction } from 'express'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
	const start = process.hrtime.bigint();
	res.on('finish', () => {
		const ms = Number(process.hrtime.bigint() - start) / 1e6;
		const line = `[${res.locals.requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`;
		if (res.statusCode >= 500) logger.err(line);
		else if (res.statusCode >= 400) logger.warn(line);
		else logger.info(line);
	});
	next();
}