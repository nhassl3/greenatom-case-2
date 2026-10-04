import jetEnv, { str } from 'jet-env'

const isBlank = (v: unknown) => v === undefined || v === '';

const strOr = (fallback: string) => (v: unknown, cb?: (val: string) => void): v is string => {
	const val = isBlank(v) ? fallback : v;
	if (typeof val !== 'string') return false;
	cb?.(val);
	return true;
};

const intOr = (fallback: number) => (v: unknown, cb?: (val: number) => void): v is number => {
	const val = isBlank(v) ? fallback : Number(v);
	if (!Number.isInteger(val) || val < 0) return false;
	cb?.(val);
	return true;
};

const DbEnv = jetEnv({
	DbHost: strOr('127.0.0.1'),
	DbPort: intOr(5432),
	DbName: str,
	DbUser: str,
	DbPassword: str,
	DbPoolMax: intOr(10),
	DbPoolMin: intOr(0),
	DbPoolIdleMs: intOr(10_000),
	DbPoolAcquireMs: intOr(30_000),
});

export default DbEnv;
