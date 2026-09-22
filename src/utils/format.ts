import { Bed, BedType, DifficultyGroup, Task, Tree } from '../types';

export const BED_TYPE_LABEL: Record<BedType, string> = {
  zeleninovy: 'Zeleninový',
  bylinkovy: 'Bylinkový',
  kvetinovy: 'Květinový',
  jiny: 'Jiný',
};

export const DIFFICULTY_LABEL: Record<DifficultyGroup, string> = {
  narocna: 'Náročná',
  stredne_narocna: 'Středně náročná',
  mene_narocna: 'Méně náročná',
  luskovina: 'Luskovina',
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
}

// Krátký souhrn "kde" - pro úkol navázaný na víc záhonů/stromů najednou.
export function taskPlacesLabel(task: Task, beds: Bed[], trees: Tree[]): string {
  const bedNames = task.bedIds.map((id) => beds.find((b) => b.id === id)?.name).filter(Boolean);
  const treeNames = task.treeIds.map((id) => trees.find((t) => t.id === id)?.name).filter(Boolean);
  const parts = [...bedNames.map((n) => `🪴 ${n}`), ...treeNames.map((n) => `🌳 ${n}`)];
  return parts.join(', ');
}

// Datum sklizně bývalo dřív ukládané jako volný text "d.m.rrrr", proto tolerantní
// rozpoznání roku i pro starší záznamy - nová appka ukládá přímo ISO datum.
export function harvestYear(dateStr: string): number {
  const iso = new Date(dateStr);
  if (!Number.isNaN(iso.getTime())) return iso.getFullYear();
  const match = dateStr.match(/^\d{1,2}\.\d{1,2}\.(\d{4})$/);
  if (match) return Number(match[1]);
  return new Date().getFullYear();
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
