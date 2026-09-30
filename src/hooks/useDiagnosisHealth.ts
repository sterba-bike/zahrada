import { useEffect, useState } from 'react';
import { checkDiagnosisHealthIfDue } from '../utils/diagnosisHealth';

interface UseDiagnosisHealthResult {
  showWarning: boolean;
  dismiss: () => void;
}

// Zavolá tichou kontrolu na pozadí (throttlovanou, viz diagnosisHealth.ts) a
// vrátí appce, jestli má ukázat nenápadné upozornění, že rozpoznávání
// choroby/škůdce možná přestalo fungovat. "dismiss" schová banner jen pro
// tohle otevření appky, ne natrvalo - dokud appka opravdu neběží, appka
// připomene při příštím otevření znovu.
export function useDiagnosisHealth(): UseDiagnosisHealthResult {
  const [broken, setBroken] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkDiagnosisHealthIfDue().then((isBroken) => {
      if (!cancelled) setBroken(isBroken);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { showWarning: broken && !dismissed, dismiss: () => setDismissed(true) };
}
