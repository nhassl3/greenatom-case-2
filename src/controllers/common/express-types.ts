import type { Request, Response } from 'express'

/******************************************************************************
                                Types
******************************************************************************/

export type Req = Request<Record<string, string>, void, Record<string, string>>;
export type Res = Response;

export type Validated<P = unknown, Q = unknown, B = unknown> = {params: P; query: Q; body: B};
export const getValidated = <P, Q, B>(res: Response) => res.locals.validated as Validated<P, Q, B>;