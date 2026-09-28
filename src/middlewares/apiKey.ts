import EnvVars from '@src/common/constants/env'
import { UnauthorizedError } from '@src/common/errors'
import { timingSafeEqual } from 'crypto'
import type { Request, Response } from 'express'
import { NextFunction } from 'express'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);


export function requireApiKey(req: Request, _res: Response, next: NextFunction) {
	if (SAFE_METHODS.has(req.method) || !EnvVars.ApiKey) return next();
	const given = Buffer.from(req.get('X-API-Key') ?? '');
	const expected = Buffer.from(EnvVars.ApiKey);
	if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
		return next(new UnauthorizedError());
	}
	next();
}
