import { randomUUID } from 'crypto'
import type { Request, Response } from 'express'
import { NextFunction } from 'express'

export function requestId(req: Request, res: Response, next: NextFunction) {
	const incoming = req.get('X-Request-Id');
	const id = incoming && /^[\w-]{1, 64}$/.test(incoming) ? incoming : randomUUID().slice(0, 8);
	res.locals.requestId = id;
	res.set('X-Request-Id', id);
	next();
}