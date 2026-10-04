import { NotFoundError } from '@src/common/errors'
import SiteRepo from '@src/repos/SiteRepo'

export const Errors = {
	SITE_NOT_FOUND: { code: 'SITE_NOT_FOUND', message: 'Площадка не найдена' },
} as const;

async function getSummary(id: string) {
	if (!(await SiteRepo.findById(id))) throw new NotFoundError(Errors.SITE_NOT_FOUND.message, Errors.SITE_NOT_FOUND.code);
	return SiteRepo.getSummary(id);
}

export default { getSummary } as const;
