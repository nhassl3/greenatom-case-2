import { Res } from './express-types'
export interface ListMeta { total: number; page: number; limit: number }

export const ok = <T>(res: Res, data: T) => res.status(200).json({data});
export const created = <T>(res: Res, location: string, data: T) => res.status(201).location(location).json({data});
export const multiStatus = <T>(res: Res, data: T) => res.status(207).json({data});
export const list = <T>(res: Res, items: T[], meta: ListMeta) => res.status(200).json({data: items, meta});
export const noContent = (res: Res) => res.status(204).end();