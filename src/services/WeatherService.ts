import EnvVars from '@src/common/constants/env'
import { AppError } from '@src/common/errors/AppError'
import { getForecast } from '@src/integrations/weather/forecast'
import { ILocation } from '@src/models/common/general'

// Functions

async function getOutdoorWorkForecast(location: ILocation) {
	try {
		const days = await getForecast({
			location,
			days: EnvVars.WeatherForecastDays,
		});

		const forecast = days.map((d) => {
			return { ...d };
		});

		return forecast;
	} catch (err) {
		if (err instanceof AppError) {
			throw err;
		}
		const message = err instanceof Error ? err.message : String(err);
		throw new AppError(500, 'INTERNAL_ERROR', 'Неизвестная ошибка', [
			{ field: 'forecast', message },
		]);
	}
}

export default {
	getOutdoorWorkForecast,
} as const;
