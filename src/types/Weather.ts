export interface WeatherResult {
  temperature: number;
  unitLabel: string;
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  rainProbability: number | null;
}

export interface ForecastResult {
  days: ForecastDay[];
  unitLabel: string;
}
