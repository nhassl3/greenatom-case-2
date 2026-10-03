import { isNumber, isString } from 'jet-validators'
import { transform } from 'jet-validators/utils'
import { validate as uuidValidate } from 'uuid'

export const EQUIPMENT_TYPES = ['turbine', 'inverter', 'sensor', 'substation'] as const;
export const EQUIPMENT_STATUSES = ['operational', 'maintenance', 'fault', 'decommissioned'] as const;
export const REQUEST_STATUSES = ['new', 'in_progress', 'done', 'rejected'] as const;
export const REQUEST_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export const OPEN_REQUEST_STATUSES = ['new', 'in_progress'] as const;
export const ASSIGNEE_ROLES = ['lead', 'member'] as const;

type Check<T> = (v: unknown) => v is T;

const skipUndefined = (fn: (v: unknown) => unknown) => (v: unknown) => (v === undefined ? undefined : fn(v));
const orUndefined = <T>(check: Check<T>) => (v: unknown): v is T | undefined => v === undefined || check(v);

const trim = (v: unknown) => (typeof v === 'string' ? v.trim() : v);
const hasLength = (min: number, max: number) =>
  (v: unknown): v is string => isString(v) && v.length >= min && v.length <= max;

const ISO_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/;
const toDate = (v: unknown) => (typeof v === 'string' && ISO_RE.test(v) ? new Date(v) : v);
const isValidDate = (v: unknown): v is Date => v instanceof Date && !Number.isNaN(v.getTime());
const isPastDate = (v: unknown): v is Date => isValidDate(v) && v <= new Date();

export const oneOf = <T extends readonly string[]>(values: T) =>
  (v: unknown): v is T[number] => typeof v === 'string' && values.includes(v);

export const stringLength = (min: number, max: number) => transform(trim, hasLength(min, max));
export const optionalStringLength = (min: number, max: number) =>
  transform(skipUndefined(trim), orUndefined(hasLength(min, max)));

export const numberInRange = (min: number, max: number) =>
  (v: unknown): v is number => isNumber(v) && Number.isFinite(v) && v >= min && v <= max;

export const isUuid = (v: unknown): v is string => typeof v === 'string' && uuidValidate(v);

export const isoDate = transform(toDate, isValidDate);
export const optionalIsoDate = transform(skipUndefined(toDate), orUndefined(isValidDate));
export const isoDateNotInFuture = transform(toDate, isPastDate);
export const optionalIsoDateNotInFuture = transform(skipUndefined(toDate), orUndefined(isPastDate));

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

export const arrayOfLength = (min: number, max: number) =>
  (v: unknown): v is unknown[] => Array.isArray(v) && v.length >= min && v.length <= max;
