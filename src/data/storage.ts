import AsyncStorage from '@react-native-async-storage/async-storage';

// Jednotné klíče pro lokální (offline) úložiště appky.
// Appka V1 běží čistě offline nad AsyncStorage - žádný server, žádná synchronizace.
export const STORAGE_KEYS = {
  garden: '@ekozahradka/garden', // legacy V1 klíč (jedna zahrada) - viz migrace v AppDataContext
  gardens: '@ekozahradka/gardens',
  activeGardenId: '@ekozahradka/activeGardenId',
  beds: '@ekozahradka/beds',
  trees: '@ekozahradka/trees',
  plantings: '@ekozahradka/plantings',
  tasks: '@ekozahradka/tasks',
  journal: '@ekozahradka/journal',
  harvests: '@ekozahradka/harvests',
  profile: '@ekozahradka/profile',
} as const;

export async function loadItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
