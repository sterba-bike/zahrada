import { AIError } from 'firebase/ai';
import { visionModel } from '../firebase/ai';

// Appka nikdy nesmí prezentovat výsledek jako jistou diagnózu (spec 5.5) -
// proto model vždy žádáme o % jistoty a dvě oddělená doporučení (eko/chemie),
// s jasným varováním u chemické varianty.
const PROMPT = `Jsi zahradnický poradce specializovaný na choroby a škůdce rostlin.
Na fotce urči nejpravděpodobnější chorobu nebo škůdce rostliny. Pokud fotka
neukazuje žádný zjevný problém nebo není vyhodnotitelná, napiš to do pole
"diagnosis" a nastav "confidencePercent" na 0.

Odpověz VÝHRADNĚ čistým JSON objektem (žádný markdown, žádný text okolo) v tomto tvaru:
{
  "diagnosis": "název choroby/škůdce v češtině, nebo popis že nelze určit",
  "confidencePercent": číslo 0-100,
  "ecoRecommendation": "doporučený ekologický postup v češtině (2-4 věty)",
  "standardRecommendation": "doporučený standardní/chemický postup v češtině (2-4 věty), s upozorněním že jde o rychlejší, ale méně šetrnou alternativu"
}`;

export interface DiagnosisResult {
  diagnosis: string;
  confidencePercent: number;
  ecoRecommendation: string;
  standardRecommendation: string;
}

function parseResponseText(raw: string): DiagnosisResult {
  // Model občas i přes instrukci obalí JSON do ```json ... ``` bloku.
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  const parsed = JSON.parse(cleaned);
  const confidence = Number(parsed.confidencePercent);
  return {
    diagnosis: String(parsed.diagnosis ?? '').trim() || 'Nepodařilo se rozpoznat',
    confidencePercent: Number.isFinite(confidence) ? Math.max(0, Math.min(100, Math.round(confidence))) : 0,
    ecoRecommendation: String(parsed.ecoRecommendation ?? '').trim(),
    standardRecommendation: String(parsed.standardRecommendation ?? '').trim(),
  };
}

// Appka rozlišuje typ selhání, ať uživatel nemá pocit, že je problém v jeho
// připojení, když je ve skutečnosti model na straně Google zrušený/přejmenovaný
// (viz historie - gemini-2.5-flash přestal fungovat) nebo je jen vyčerpaný
// bezplatný limit dotazů.
export type DiagnosisErrorKind = 'model_unavailable' | 'quota_exceeded' | 'network' | 'unknown';

export class DiagnosisError extends Error {
  kind: DiagnosisErrorKind;
  constructor(kind: DiagnosisErrorKind) {
    super(`diagnosis_failed:${kind}`);
    this.kind = kind;
  }
}

function classifyError(e: unknown): DiagnosisErrorKind {
  if (e instanceof AIError) {
    const status = (e.customErrorData as { status?: number } | undefined)?.status;
    if (status === 404 || status === 400) return 'model_unavailable';
    if (status === 429) return 'quota_exceeded';
    if (e.code === 'api-not-enabled') return 'model_unavailable';
    return 'network'; // fetch-error bez stavového kódu = výpadek sítě, ne problém appky
  }
  return 'unknown'; // např. odpověď modelu nešla rozparsovat jako JSON
}

// base64 bez prefixu "data:image/...;base64," - to appka posílá zvlášť jako mimeType.
export async function diagnosePhoto(base64: string, mimeType: string): Promise<DiagnosisResult> {
  try {
    const result = await visionModel.generateContent([
      PROMPT,
      { inlineData: { mimeType, data: base64 } },
    ]);
    return parseResponseText(result.response.text());
  } catch (e) {
    throw new DiagnosisError(classifyError(e));
  }
}

export type DiagnosisHealth = 'ok' | 'broken' | 'unknown';

// Nenápadné "pozdravení" s modelem na pozadí (viz src/utils/diagnosisHealth.ts) -
// jen zjistí, jestli appka umí model vůbec zavolat, bez fotky.
export async function pingDiagnosisModel(): Promise<DiagnosisHealth> {
  try {
    await visionModel.generateContent('Odpověz jedním slovem: OK');
    return 'ok';
  } catch (e) {
    return classifyError(e) === 'model_unavailable' ? 'broken' : 'unknown';
  }
}
