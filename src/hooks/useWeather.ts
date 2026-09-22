import { useCallback, useEffect, useState } from 'react';
import { loadItem, saveItem } from '../data/storage';
import { useAppData } from '../context/AppDataContext';
import { geocodeLocation, fetchForecast, fetchYearlyRain } from '../utils/weather';
import { WeatherDay } from '../types';

// Appka "věří" stažené předpovědi 3 hodiny - pak ji zkusí obnovit, ale starou
// mezitím dál ukazuje (viz otevřená otázka v sekci 7 specifikace).
const FORECAST_STALE_AFTER_MS = 3 * 60 * 60 * 1000;
const YEARLY_STALE_AFTER_MS = 24 * 60 * 60 * 1000;

const forecastCacheKey = (gardenId: string) => `@ekozahradka/weatherCache/${gardenId}`;
const yearlyCacheKey = (gardenId: string) => `@ekozahradka/yearlyRainCache/${gardenId}`;

interface ForecastCache {
  fetchedAt: string;
  days: WeatherDay[];
}

interface UseForecastResult {
  days: WeatherDay[] | null;
  loading: boolean;
  error: boolean;
  stale: boolean;
  fetchedAt: string | null;
  refresh: () => void;
}

// Předpověď + zpětné srážky (30 dní) pro aktivní zahradu. Souřadnice appka
// dopočte a uloží k zahradě při prvním použití (geokódování z lokality).
export function useGardenForecast(): UseForecastResult {
  const { garden, updateGarden } = useAppData();
  const [days, setDays] = useState<WeatherDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stale, setStale] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const gardenId = garden?.id;
  const gardenLocation = garden?.location;

  useEffect(() => {
    let cancelled = false;
    if (!gardenId) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(false);

      const cached = await loadItem<ForecastCache | null>(forecastCacheKey(gardenId), null);
      if (cached && !cancelled) {
        setDays(cached.days);
        setFetchedAt(cached.fetchedAt);
        setStale(Date.now() - new Date(cached.fetchedAt).getTime() > FORECAST_STALE_AFTER_MS);
      }

      try {
        let lat = garden?.lat;
        let lon = garden?.lon;
        if (lat == null || lon == null) {
          const geo = await geocodeLocation(gardenLocation ?? '');
          if (!geo) throw new Error('geocode_failed');
          lat = geo.lat;
          lon = geo.lon;
          await updateGarden(gardenId, { lat, lon });
        }
        const fresh = await fetchForecast(lat, lon);
        if (cancelled) return;
        const nowIso = new Date().toISOString();
        setDays(fresh);
        setFetchedAt(nowIso);
        setStale(false);
        await saveItem(forecastCacheKey(gardenId), { fetchedAt: nowIso, days: fresh });
      } catch {
        if (!cancelled && !cached) setError(true);
        // Jinak necháme zobrazenou starou cache (stale zůstává true) - appka
        // funguje i bez internetu, jen s posledními známými daty.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gardenId, gardenLocation, refreshTick]);

  const refresh = useCallback(() => setRefreshTick((n) => n + 1), []);

  return { days, loading, error, stale, fetchedAt, refresh };
}

export interface MonthlyRain {
  month: string; // yyyy-mm
  mm: number;
}

interface UseYearlyRainResult {
  monthly: MonthlyRain[] | null;
  loading: boolean;
  error: boolean;
}

// Načte se líně, až když si uživatel v Přehledu počasí vybere období "rok" -
// jinak appka zbytečně nestahuje rok dat, která nikdo neuvidí.
export function useYearlyRain(enabled: boolean): UseYearlyRainResult {
  const { garden } = useAppData();
  const [monthly, setMonthly] = useState<MonthlyRain[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const gardenId = garden?.id;
  const lat = garden?.lat;
  const lon = garden?.lon;

  useEffect(() => {
    if (!enabled || !gardenId || lat == null || lon == null || monthly) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(false);
      try {
        const cached = await loadItem<{ fetchedAt: string; monthly: MonthlyRain[] } | null>(
          yearlyCacheKey(gardenId),
          null
        );
        if (cached && Date.now() - new Date(cached.fetchedAt).getTime() < YEARLY_STALE_AFTER_MS) {
          if (!cancelled) setMonthly(cached.monthly);
          return;
        }

        const raw = await fetchYearlyRain(lat, lon);
        const byMonth = new Map<string, number>();
        for (const d of raw) {
          const month = d.date.slice(0, 7);
          byMonth.set(month, (byMonth.get(month) ?? 0) + d.precipitationMm);
        }
        const result = Array.from(byMonth.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, mm]) => ({ month, mm: Math.round(mm) }));

        if (cancelled) return;
        setMonthly(result);
        await saveItem(yearlyCacheKey(gardenId), { fetchedAt: new Date().toISOString(), monthly: result });
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, gardenId, lat, lon, monthly]);

  return { monthly, loading, error };
}
