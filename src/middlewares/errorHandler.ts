import { IsProduction } from '@src/common/constants/env'
import { AppError } from '@src/common/errors/AppError'
import logger from '@src/common/utils/logger'
import type { Request, Response } from 'express'
import { NextFunction } from 'express'

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
	const requestId = res.locals.requestId as string;
	
	let appErr: AppError;
	if (err instanceof AppError) {
		appErr = err;
	} else if (isBodyParserError(err, 'entity.parse.failed')) {
		appErr = new AppError(400, 'INVALID_JSON', 'Тело запроса не является корректным JSON');
	} else if (isBodyParserError(err, 'entity.too.large')) {
		appErr = new AppError(413, 'PAYLOAD_TOO_LARGE', 'Превышен допустимый размер тела запроса');
	} else {
		logger.err(`[${requestId}] ${req.method} ${req.originalUrl} ${(err as Error)?.stack ?? String(err)}`);
		appErr = new AppError(500, "INTERNAL_ERROR", IsProduction ? "Внутренняя ошибка сервера" : String((err as Error)?.message ?? err));
	}

	if (appErr.status < 500) logger.warn(`[${requestId}] ${req.method} ${req.originalUrl} ${(err as Error)?.stack ?? String(err)}`);

	res.status(appErr.status).json({
		error: {
			code: appErr.code,
			message: appErr.message,
			...(appErr.details ? {details: appErr.details} : {}),
			requestId,
		},
	});
}

function isBodyParserError(err: unknown, type: string): boolean {
		return typeof err === 'object' && err !== null && (err as {type ?: string}).type === type;
}