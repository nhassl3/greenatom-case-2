import { AppError, ErrorDetail } from './AppError'

export class NotFoundError extends AppError {
	constructor(message="Ресурс не найден", code='NOT_FOUND') {super(404, code, message)};
}

export class ConflictError extends AppError {
	constructor(message: string, code='CONFLICT') { super(409, code, message )};
}

export class AlreadyExistsError extends ConflictError {
	constructor(message: string = "Ресурс уже находится в системе") {super(message, "ALREADY_EXISTS")}; // CODE = ALREADY_EXISTS | CONFLICT ???
}

export class ValidationError extends AppError {
	constructor(details: ErrorDetail[], status: 400 | 422 = 400) {
		super(status, "VALIDATION_ERROR", "Некорректные данные запроса", details);
	}
}

export class UnauthorizedError extends AppError {
	constructor() { super(401, "UNAUTHORIZED", "Требуется корректные API-ключ"); }
}

export class TooManyRequestsError extends AppError {
  constructor() { super(429, 'TOO_MANY_REQUESTS', 'Превышен лимит запросов, попробуйте позже'); }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, status: 502 | 504 = 502, code = 'WEATHER_UNAVAILABLE') {
    super(status, code, message);
  }
}
