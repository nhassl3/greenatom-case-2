import type { Request, Response } from 'express'
import { NextFunction } from 'express'

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);