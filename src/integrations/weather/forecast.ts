import EnvVars from '@src/common/constants/env'
import { ILocation } from '@src/models/common/general'
import { InvalidJsonError } from './common/errors'
import { fetchJson } from './http'

// Types

export interface DailyForecast {
	date: string;
	tempMax: number;
	tempMin: number;
	precipitation: number;
}

export interface ForecastParams {
	location: ILocation
	days: number;
}

interface OpenMeteoDaily {
	time: string[];
	temperature_2m_max: number[];
	temperature_2m_min: number[];
	precipitation_sum: number[];
}

// Functions

function isDaily(arg: unknown): arg is OpenMeteoDaily {
	const d = arg as Partial<OpenMeteoDaily> | undefined;
	return !!d && [d.time, d.temperature_2m_max, d.temperature_2m_min, d.precipitation_sum].every(Array.isArray);
}

export function parseForecastResponse(data: unknown): DailyForecast[] {
	const daily = (data as { daily?: unknown } | null)?.daily;
	if (!isDaily(daily)) {
		throw new InvalidJsonError('Сервер вернул неожиданный формат прогноза');
	}
	return daily.time.map((date, i) => ({
		date,
		tempMax: daily.temperature_2m_max[i],
		tempMin: daily.temperature_2m_min[i],
		precipitation: daily.precipitation_sum[i],
	}));
}

export async function getForecast({ location, days }: ForecastParams): Promise<DailyForecast[]> {
	const data = await fetchJson(EnvVars.WeatherApiUrl, {
		latitude: location.lat,
		longitude: location.lon,
		daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
		forecast_days: days,
		timezone: 'auto',
		temperature_unit: EnvVars.WeatherTemperatureUnit,
		precipitation_unit: EnvVars.WeatherPrecipitationUnit,
	});
	return parseForecastResponse(data);
}
