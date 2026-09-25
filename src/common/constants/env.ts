import jetEnv, { num, str } from 'jet-env'
import tspo from 'tspo'

/******************************************************************************
                                 Constants
******************************************************************************/

// NOTE: These need to match the names of your ".env" files
export const NodeEnvs = {
  DEV: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;

/******************************************************************************
                                 Setup
******************************************************************************/

const EnvVars = jetEnv({
  NodeEnv: (v) => tspo.isValue(NodeEnvs, v),
  Port: num,
  CorsOrigins: str,
  RateLimitWindowMs: num,
  RateLimitMax: num,
  BodyLimit: str,
  WeatherApiUrl: str,
  RequestTimeoutMs: num,
  WeatherForecastDays: num,
  WeatherMaxWindMs: num,
  WeatherMaxPrecipitationMm: num,
  ApiKey: str,
});

/******************************************************************************
                            Export default
******************************************************************************/

export const CorsOrigins = EnvVars.CorsOrigins.split(',').map((s) => s.trim()).filter(Boolean);
export const IsProduction = EnvVars.NodeEnv === NodeEnvs.PRODUCTION;

export default EnvVars;
