import { isNumber, isString } from 'jet-validators'
import { transform } from 'jet-validators/utils'
import { validate as uuidValidate } from 'uuid'

export const EQUIPMENT_TYPES = ['turbine', 'inverter', 'sensor', 'substation'] as const;
export const EQUIPMENT_STATUSES = ['operational', 'maintenance', 'fault', 'decommissioned'] as const;
export const REQUEST_STATUSES = ['new', 'in_progress', 'done', 'rejected'] as const;
export const REQUEST_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export const OPEN_REQUEST_STATUSES = ['new', 'in_progress'] as const;

export const oneOf = <T extends readonly string[]>(values: T) =>
  (v: unknown): v is T[number] => typeof v === 'string' && values.includes(v);

export const stringLength = (min: number, max: number) =>
  transform(
    (v) => (typeof v === 'string' ? v.trim() : v),
    (v): v is string => isString(v) && v.length >= min && v.length <= max,
  );

export const numberInRange = (min: number, max: number) =>
  (v: unknown): v is number => isNumber(v) && Number.isFinite(v) && v >= min && v <= max;

export const isUuid = (v: unknown): v is string => typeof v === 'string' && uuidValidate(v);

const ISO_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/;
export const isoDate = transform(
  (v) => (typeof v === 'string' && ISO_RE.test(v) ? new Date(v) : v),
  (v): v is Date => v instanceof Date && !Number.isNaN(v.getTime()),
);

export const isoDateNotInFuture = transform(
  (v) => (typeof v === 'string' && ISO_RE.test(v) ? new Date(v) : v),
  (v): v is Date => v instanceof Date && !Number.isNaN(v.getTime()) && v <= new Date(),
);

export const optional = <T>(fn: (v: unknown) => v is T) =>
  (v: unknown): v is T | undefined => v === undefined || fn(v);

export const queryInt = (min: number, max: number) =>
  transform(
    (v) => (v === undefined ? undefined : Number(v)),
    (v): v is number | undefined => v === undefined || (Number.isInteger(v) && (v as number) >= min && (v as number) <= max),
);

export const sortParam = (fields: readonly string[]) =>
  (v: unknown): v is string | undefined =>
    v === undefined || (typeof v === 'string' && fields.includes(v.replace(/^-/, '')));