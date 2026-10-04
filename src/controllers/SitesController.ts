import SiteService from '@src/services/SiteService'
import { getValidated, type Req, type Res } from './common/express-types'
import * as respond from './common/respond'

/**
 * Сводка по заявкам площадки
 *
 * @route GET /api/sites/:id/summary
 */
async function summary(_: Req, res: Res) {
	const { params } = getValidated<{id: string}, never, never>(res);
	respond.ok(res, await SiteService.getSummary(params.id));
}

export default { summary } as const;
