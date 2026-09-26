import { CorsOrigins } from '@src/common/constants/env'
import { CorsOptions } from 'cors'

export const corsOptions: CorsOptions = {
	origin(origin, cb) {
		if (!origin || CorsOrigins.includes(origin)) return cb(null, true);
		cb(null, false);
	},
	methods: ['GET', 'POST', 'PATCH', 'DELETE'],
	allowedHeaders: ['Content-Type', 'X-Request-Id', 'X-API-Key'],
	exposedHeaders: ['X-Request-Id', 'Location', 'RateLimit', 'RateLimit-Policy', 'Retry-After'],
	maxAge: 600,
};