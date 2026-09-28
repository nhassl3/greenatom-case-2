import EnvVars from '@src/common/constants/env'
import { getForecast } from '@src/integrations/weather/forecast'
import { ILocation } from '@src/models/common/general'

// Functions

async function getOutdoorWorkForecast(location: ILocation) {
	const days = await getForecast({
		location,
		days: EnvVars.WeatherForecastDays,
	});

	const forecast = days.map((d) => {
		return { ...d };
	});

	return forecast;
}

export default {
	getOutdoorWorkForecast,
} as const;
