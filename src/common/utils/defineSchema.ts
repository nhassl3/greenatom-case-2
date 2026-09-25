import { ParseError, parseObject, Schema } from 'jet-validators/utils'

export interface ValidationSchema<T = unknown> {
	parse: (arg: unknown, onError: (e: ParseError[]) => void) => T | false;
	messages: Record<string, string>;
}
export function defineSchema<T>(schema: Schema<T> | object, messages: Record<string, string>): ValidationSchema<T> {
	return { parse: parseObject(schema as Schema<T>) as ValidationSchema<T>['parse'], messages};
}