import { loadItem, saveItem, STORAGE_KEYS } from '../data/storage';
import { pingDiagnosisModel } from './diagnosis';

// Appka se jednou za čas sama "pozdraví" s AI modelem na pozadí, ať dokáže
// upozornit, i když rozpoznávání choroby/škůdce přestane fungovat (např. kvůli
// zrušenému modelu na straně Google), aniž by to uživatel musel sám zkusit.
// Dokud appka funguje, stačí kontrola jednou za 2 týdny; jakmile je rozbitá,
// zkouší to appka denně, ať se oprava rychle projeví.
const CHECK_INTERVAL_OK_MS = 14 * 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_BROKEN_MS = 24 * 60 * 60 * 1000;

interface StoredHealth {
  lastCheckedAt: string;
  broken: boolean;
}

export async function checkDiagnosisHealthIfDue(): Promise<boolean> {
  const stored = await loadItem<StoredHealth | null>(STORAGE_KEYS.diagnosisHealth, null);
  const interval = stored?.broken ? CHECK_INTERVAL_BROKEN_MS : CHECK_INTERVAL_OK_MS;
  if (stored && Date.now() - new Date(stored.lastCheckedAt).getTime() < interval) {
    return stored.broken;
  }

  const result = await pingDiagnosisModel();
  if (result === 'unknown') {
    // Dočasný výpadek sítě nebo vyčerpaný limit - appka nic neukládá ani
    // neukazuje, ať zbytečně neplaší, a zkusí to znovu při příštím otevření.
    return stored?.broken ?? false;
  }

  const broken = result === 'broken';
  await saveItem(STORAGE_KEYS.diagnosisHealth, { lastCheckedAt: new Date().toISOString(), broken });
  return broken;
}
