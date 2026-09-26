import { NotFoundError } from '@src/common/errors'
import type { Request, Response } from 'express'
import { NextFunction } from 'express'

export function notFound(req: Request, res: Response, next: NextFunction) {
	next(new NotFoundError(`Маршрут ${req.method} ${req.originalUrl} не найден`, "ROUTE_NOT_FOUND"));
}

