import { ConnectionAcquireTimeoutError, ConnectionError, DatabaseError, ForeignKeyConstraintError, UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize'
import { AppError } from './AppError'

const PG_CHECK_VIOLATION = '23514';
const PG_RESTRICT_VIOLATION = '23001'; // триггер append-only

const SERIAL_UNIQUE_INDEX = 'equipment_serial_number_active_uq';

/**
 * Ошибки БД → прикладные ошибки (формат ответа прежний). Неизвестные ошибки возвращают null (останутся 500).
 *  - уникальность → 409; FK при insert/update → 404, при delete → 409; CHECK и валидация модели → 422
 */
export function mapDbError(err: unknown): AppError | null {
	if (err instanceof UniqueConstraintError) {
		const constraint = (err.parent as { constraint?: string } | undefined)?.constraint;
		if (constraint === SERIAL_UNIQUE_INDEX) {
			return new AppError(409, 'SERIAL_NUMBER_TAKEN', 'Серийный номер уже занят');
		}
		return new AppError(409, 'CONFLICT', 'Запись с такими данными уже существует');
	}

	if (err instanceof ForeignKeyConstraintError) {
		const detail = String((err.parent as { detail?: string } | undefined)?.detail ?? '');
		if (detail.includes('is still referenced')) {
			return new AppError(409, 'CONFLICT', 'Запись используется другими данными');
		}
		return new AppError(404, 'NOT_FOUND', 'Связанная запись не найдена');
	}

	if (err instanceof SequelizeValidationError) {
		return new AppError(422, 'VALIDATION_ERROR', 'Некорректные данные запроса',
			err.errors.map((e) => ({ field: e.path ?? '', message: e.message })));
	}

	if (err instanceof ConnectionError || err instanceof ConnectionAcquireTimeoutError) {
		return new AppError(503, 'DB_UNAVAILABLE', 'База данных недоступна');
	}

	if (err instanceof DatabaseError) {
		const code = (err.parent as { code?: string } | undefined)?.code;
		if (code === PG_CHECK_VIOLATION) return new AppError(422, 'VALIDATION_ERROR', 'Данные нарушают ограничение целостности');
		if (code === PG_RESTRICT_VIOLATION) return new AppError(409, 'APPEND_ONLY', 'Запись журнала нельзя изменить или удалить');
	}

	return null;
}
