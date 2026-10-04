import { EquipmentLoadParams } from '@src/common/utils/reports.validators'
import ReportService from '@src/services/ReportService'
import { getValidated, type Req, type Res } from './common/express-types'

/**
 * Отчёт «загрузка оборудования»
 *
 * @route GET /api/reports/equipment-load
 */
async function equipmentLoad(_: Req, res: Res) {
	const { query } = getValidated<never, EquipmentLoadParams, never>(res);
	const { items, meta } = await ReportService.equipmentLoad(query);
	res.status(200).json({ data: items, meta });
}

export default { equipmentLoad } as const;
