import EnvVars from '@src/common/constants/env'
import { TooManyRequestsError } from '@src/common/errors'
import { rateLimit } from 'express-rate-limit'

export const apiLimiter = rateLimit({
	windowMs: EnvVars.RateLimitWindowMs,
	limit: EnvVars.RateLimitMax,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	handler: (req, res, next, options) => {
		res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000));
		next(new TooManyRequestsError());
	},
});