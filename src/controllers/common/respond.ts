import { Res } from './express-types'

export const ok = <T>(res: Res, data: T) => res.status(200).json({data});
export const created = <T>(res: Res, location: string, data: T) => res.status(201).location(location).json({data});
export const list = <T>(res: Res, items: T[], meta: { total: number; page: number; limit: number}) => res.status(200).json({data: items, meta});
export const noContent = <T>(res: Res) => res.json(204).end();