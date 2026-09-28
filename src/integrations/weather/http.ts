
import EnvVars from '@src/common/constants/env'
import { ApiError, InvalidJsonError, NetworkError, TimeoutError } from './common/errors'

export async function fetchJson(baseUrl: string, params = {}) {
	const url = new URL(baseUrl);
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			url.searchParams.set(key, String(value));
		}
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), EnvVars.RequestTimeoutMs);

	try {
		const res = await fetch(url, { method: 'GET', signal: controller.signal });

		if (!res.ok) {
			if (res.status >= 500) {
				throw new ApiError(`Сервис временно недоступен (код ${res.status})`, res.status);
			}
			throw new ApiError(`Некорректный запрос к API (код ${res.status})`, res.status);
		}

		try {
			return await res.json();
		} catch {
			throw new InvalidJsonError();
		}
	} catch (err) {
		if (err instanceof ApiError || err instanceof InvalidJsonError) {
			throw err;
		}
		if (err.name === 'AbortError') {
			throw new TimeoutError();
		}
		throw new NetworkError();
	} finally {
		clearTimeout(timeout);
	}
}