import { ErrorDetail } from '@src/common/errors/AppError'
import { ParseError, parseObject, Schema } from 'jet-validators/utils'

export interface ValidationSchema<T = unknown> {
	parse: (arg: unknown, onError: (e: ParseError[]) => void) => T | false;
	messages: Record<string, string>;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; details: ErrorDetail[] };

export function defineSchema<T>(schema: Schema<T> | object, messages: Record<string, string>): ValidationSchema<T> {
	return { parse: parseObject(schema as Schema<T>) as ValidationSchema<T>['parse'], messages};
}

/**
 * Проверка по схеме с человекочитаемыми сообщениями по каждому полю.
 * fallbackField подставляется, если ошибка не относится к конкретному полю (например, тело — не объект).
 */
export function parseWithDetails<T>(schema: ValidationSchema<T>, input: unknown, fallbackField: string): ParseResult<T> {
	const details: ErrorDetail[] = [];
	const value = schema.parse(input, (errors) => {
		for (const e of errors) {
			const field = e.keyPath?.join('.') ?? e.key ?? fallbackField;
			details.push({
				field,
				message: schema.messages[field] ?? schema.messages[e.key ?? ''] ?? 'Недопустимое значение',
			});
		}
	});
	return details.length || value === false ? { ok: false, details } : { ok: true, value };
}
