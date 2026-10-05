import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useAppData } from '../context/AppDataContext';
import { geocodeLocation } from '../utils/weather';
import { distanceKm } from '../utils/distance';
import { Garden } from '../types';

interface UseNearestGardenResult {
  orderedGardens: Garden[];
  nearestId: string | null;
}

// Jen s víc než jednou zahradou má smysl appku ptát na polohu telefonu
// (sekce 3 specifikace - "Moje zahrady"). Appka si svolení vyžádá jen
// jednou za otevření téhle obrazovky, polohu nikam neukládá ani neposílá -
// použije se jen k výpočtu pořadí tady v appce.
export function useNearestGarden(): UseNearestGardenResult {
  const { gardens, updateGarden } = useAppData();
  const [deviceCoords, setDeviceCoords] = useState<{ lat: number; lon: number } | null>(null);
  const gardenIds = gardens.map((g) => g.id).join(',');

  useEffect(() => {
    if (gardens.length < 2) return;
    let cancelled = false;
    (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted || cancelled) return;
        const position = await Location.getCurrentPositionAsync({});
        if (!cancelled) {
          setDeviceCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        }
      } catch {
        // Bez polohy appka jen nechá zahrady v původním pořadí - nic se nerozbije.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gardens.length]);

  // Doplní souřadnice zahradám, které je ještě nemají (appka je jinak
  // dopočítá, jen když je daná zahrada zrovna aktivní, kvůli počasí).
  useEffect(() => {
    if (!deviceCoords) return;
    const missing = gardens.filter((g) => g.lat == null || g.lon == null);
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const g of missing) {
        if (cancelled) return;
        const geo = await geocodeLocation(g.location).catch(() => null);
        if (geo && !cancelled) await updateGarden(g.id, { lat: geo.lat, lon: geo.lon });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceCoords, gardenIds]);

  if (!deviceCoords || gardens.length < 2) {
    return { orderedGardens: gardens, nearestId: null };
  }

  const withDistance = gardens.map((g) => ({
    garden: g,
    distance:
      g.lat != null && g.lon != null ? distanceKm(deviceCoords.lat, deviceCoords.lon, g.lat, g.lon) : null,
  }));

  const sorted = [...withDistance].sort((a, b) => {
    if (a.distance == null && b.distance == null) return 0;
    if (a.distance == null) return 1;
    if (b.distance == null) return -1;
    return a.distance - b.distance;
  });

  const nearestId = sorted[0]?.distance != null ? sorted[0].garden.id : null;

  return { orderedGardens: sorted.map((s) => s.garden), nearestId };
}
