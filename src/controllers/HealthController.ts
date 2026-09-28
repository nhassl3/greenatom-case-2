import HttpStatusCodes from '@src/common/constants/HttpStatusCodes'
import { Req, Res } from './common/express-types'

/**
 * Проверка доступности сервиса
 * @param _ request
 * @param res response
 * @route GET /api/health
 */
function health(_: Req, res: Res): void {
	res.status(HttpStatusCodes.OK).json({"status": "ok"});
}

export default {
	health,
} as const;