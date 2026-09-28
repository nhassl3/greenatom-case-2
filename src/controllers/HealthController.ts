import { Req, Res } from './common/express-types'
import { ok } from './common/respond'

/**
 * Проверка доступности сервиса
 * @param _ request
 * @param res response
 * @route GET /api/health
 */
function health(_: Req, res: Res): void {
	ok(res, { status: 'ok', uptime: Math.floor(process.uptime()) });
}

export default {
	health,
} as const;