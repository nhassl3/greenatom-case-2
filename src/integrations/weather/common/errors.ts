export class AppError extends Error {
	public readonly code: string;

	constructor(message: string, code: string) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super(message, 'VALIDATION_ERROR');
	}
}

export class ApiError extends AppError {
	public readonly status: number;

	constructor(message: string, status: number) {
		super(message, 'API_ERROR');
		this.status = status;
	}
}

export class NetworkError extends AppError {
	constructor(message = 'Нет соединения с сетью') {
		super(message, 'NETWORK_ERROR');
	}
}

export class TimeoutError extends AppError {
	constructor(message = 'Превышено время ожидания ответа от сервера') {
		super(message, 'TIMEOUT_ERROR');
	}
}

export class InvalidJsonError extends AppError {
	constructor(message = 'Сервер вернул некорректный JSON') {
		super(message, 'INVALID_JSON');
	}
}