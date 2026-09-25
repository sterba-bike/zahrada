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

// base64 bez prefixu "data:image/...;base64," - to appka posílá zvlášť jako mimeType.
export async function diagnosePhoto(base64: string, mimeType: string): Promise<DiagnosisResult> {
  try {
    const result = await visionModel.generateContent([
      PROMPT,
      { inlineData: { mimeType, data: base64 } },
    ]);
    return parseResponseText(result.response.text());
  } catch {
    throw new Error('diagnosis_failed');
  }
}
