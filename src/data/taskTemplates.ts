import { TaskType } from '../types';

export interface TaskTemplate {
  offsetDays: number; // kolik dní po vysazení
  type: TaskType;
  title: string;
}

// PROTOTYP automatizace dle agrolhůt (sekce "výhled automatizace" v zadání) - jen pár
// nejběžnějších druhů a orientační odstupy. Než appka bude mít skutečná agronomická
// data, slouží tohle jako základ k vyzkoušení a postupnému rozšiřování.
export const TASK_TEMPLATES_BY_SPECIES: Record<string, TaskTemplate[]> = {
  rajce: [
    { offsetDays: 14, type: 'hnojeni', title: 'Přihnojit rajčata' },
    { offsetDays: 21, type: 'orez', title: 'Vyštipovat zálistky u rajčat' },
  ],
  okurka_salatovka: [{ offsetDays: 14, type: 'hnojeni', title: 'Přihnojit okurky' }],
  okurka_nakladacka: [{ offsetDays: 14, type: 'hnojeni', title: 'Přihnojit okurky' }],
  brambory: [{ offsetDays: 21, type: 'jine', title: 'Prvně přihrnout brambory' }],
  mrkev: [{ offsetDays: 21, type: 'jine', title: 'Prořídit sazenice mrkve' }],
  fazol_tyckovy: [{ offsetDays: 10, type: 'jine', title: 'Zkontrolovat oporu pro fazol' }],
};

export function getTaskTemplates(speciesId: string): TaskTemplate[] {
  return TASK_TEMPLATES_BY_SPECIES[speciesId] ?? [];
}
