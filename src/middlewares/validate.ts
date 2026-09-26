import { ValidationError } from '@src/common/errors'
import { ErrorDetail } from '@src/common/errors/AppError'
import { ValidationSchema } from '@src/common/utils/defineSchema'
import type { Request, Response } from 'express'
import { NextFunction } from 'express'

type Part = 'params' | 'query' | 'body';

export function validate(schemas: Partial<Record<Part, ValidationSchema>>) {
	const parts = Object.entries(schemas) as [Part, ValidationSchema][];
	return (req: Request, res: Response, next: NextFunction) => {
		const details: ErrorDetail[] = [];
		let bodyFailed = false;
		const validated: Partial<Record<Part, unknown>> = {};

		for (const [part, schema] of parts) {
				const input = req[part] ?? {};
				const result = schema.parse(input, (errors) => {
					if (part === 'body') bodyFailed = true;
					for (const e of errors) {
						const field = e.keyPath?.join('.') ?? e.key ?? part;
						details.push({ field, message: schema.messages[field] ?? schema.messages[e.key ?? ''] ?? "Недопустимое значение"});
					}
				});
				validated[part] = result;
		}
		
		if (details.length) return next(new ValidationError(details, bodyFailed ? 422 : 400));
		res.locals.validated = validated;
		next();
	}
}