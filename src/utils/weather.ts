import { WeatherDay } from '../types';

// Open-Meteo - zdarma, bez účtu a bez API klíče (viz rozhodnutí u V2 "Skutečné počasí").
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export interface GeocodedLocation {
  lat: number;
  lon: number;
}

// Převede textovou lokalitu zahrady (např. "Brno-venkov") na souřadnice.
// Appka nepoužívá GPS telefonu (viz rozhodnutí u V2) - jen tohle geokódování.
export async function geocodeLocation(query: string): Promise<GeocodedLocation | null> {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=1&language=cs&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const first = data?.results?.[0];
  if (!first || typeof first.latitude !== 'number' || typeof first.longitude !== 'number') return null;
  return { lat: first.latitude, lon: first.longitude };
}

function parseDaily(daily: {
  time?: string[];
  weathercode?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_sum?: number[];
}): WeatherDay[] {
  const dates = daily.time ?? [];
  return dates.map((date, i) => ({
    date,
    weatherCode: daily.weathercode?.[i] ?? 0,
    tempMin: daily.temperature_2m_min?.[i] ?? 0,
    tempMax: daily.temperature_2m_max?.[i] ?? 0,
    precipitationMm: daily.precipitation_sum?.[i] ?? 0,
  }));
}

// Předpověď na 8 dní dopředu (dnešek + týden) a zpětně 30 dní (pro graf srážek 7/30 dní
// a pro pravidlo "sucho" v eko-tipech) - jedno volání pokryje obě potřeby.
export async function fetchForecast(lat: number, lon: number): Promise<WeatherDay[]> {
  const url =
    `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&timezone=auto&past_days=30&forecast_days=8`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather_fetch_failed');
  const data = await res.json();
  return parseDaily(data.daily ?? {});
}

// Historické srážky za poslední rok - samostatné volání, ať appka nestahuje zbytečně
// 365 dní dat, dokud si uživatel v Přehledu počasí vyloženě nezobrazí období "rok".
export async function fetchYearlyRain(lat: number, lon: number): Promise<{ date: string; precipitationMm: number }[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 365);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const url =
    `${ARCHIVE_URL}?latitude=${lat}&longitude=${lon}` +
    `&daily=precipitation_sum&timezone=auto&start_date=${fmt(start)}&end_date=${fmt(end)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather_fetch_failed');
  const data = await res.json();
  const dates: string[] = data.daily?.time ?? [];
  const precip: number[] = data.daily?.precipitation_sum ?? [];
  return dates.map((date, i) => ({ date, precipitationMm: precip[i] ?? 0 }));
}

// Mapování WMO kódů počasí (Open-Meteo) na emoji ikonu.
const WEATHER_ICON: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌦️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '🌨️',
  77: '🌨️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '🌨️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

export function weatherIcon(code: number): string {
  return WEATHER_ICON[code] ?? '🌡️';
}
