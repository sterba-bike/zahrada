import { Garden, PlantingRecord, Profile } from '../types';
import { getSpeciesById } from '../data/seedPlants';
import { SEASONAL_ECO_TIPS } from '../data/ecoTips';

// Pravidlový systém pro eko-tip na Nástěnce (sekce 5.3 specifikace).
// Appka vybere tip s nejvyšší prioritou, jehož podmínka aktuálně platí.
//
// Priority 10 (Mráz) a 8 (Sucho) ze vzorové sady ve specifikaci vyžadují
// skutečná data o počasí, která appka zatím nemá (viz V2 - Skutečné počasí,
// zatím odloženo). Prioritní sloty 10 a 8 jsou proto záměrně volné - až appka
// bude mít reálné počasí, přidá se sem odpovídající pravidlo bez zásahu
// do zbytku enginu.

export interface EcoTipResult {
  ruleId: string;
  priority: number;
  text: string;
}

interface EcoTipContext {
  today: Date;
  garden: Garden | null;
  profile: Profile;
  plantings: PlantingRecord[];
}

interface EcoTipRule {
  id: string;
  priority: number;
  evaluate: (ctx: EcoTipContext) => string | null;
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diffMs = d.getTime() - start.getTime();
  return Math.floor(diffMs / 86400000);
}

// Priorita 5 - Historie záhonu: pokud v některém záhonu loni rostla plodina
// z náročné skupiny, doporučí letos luskoviny (obohacují půdu dusíkem).
const bedHistoryRule: EcoTipRule = {
  id: 'bed-history-narocna',
  priority: 5,
  evaluate: (ctx) => {
    const lastYear = ctx.today.getFullYear() - 1;
    const hadNarocna = ctx.plantings.some((p) => {
      if (p.year !== lastYear) return false;
      const species = getSpeciesById(p.speciesId);
      return species?.difficultyGroup === 'narocna';
    });
    if (!hadNarocna) return null;
    return 'Loni jste na některém záhonu pěstovali náročnou plodinu (hodně vyčerpává půdu). Letos tam zkuste luskoviny, jako fazol nebo hrách - obohatí půdu dusíkem pro příští sezónu.';
  },
};

// Priorita 4 - Konkrétní rostlina: appka připomene časté chyby u jednoho
// z aktuálně pěstovaných druhů (mění se v čase, ať appka nepůsobí staticky).
const currentPlantMistakeRule: EcoTipRule = {
  id: 'current-plant-mistake',
  priority: 4,
  evaluate: (ctx) => {
    const growingSpeciesIds = Array.from(
      new Set(
        ctx.plantings
          .filter((p) => p.status.trim().toLowerCase() === 'roste')
          .map((p) => p.speciesId)
      )
    ).sort();
    if (growingSpeciesIds.length === 0) return null;
    const index = dayOfYear(ctx.today) % growingSpeciesIds.length;
    const species = getSpeciesById(growingSpeciesIds[index]);
    if (!species) return null;
    return `${species.name}: ${species.commonMistakes}`;
  },
};

// Priorita 3 - Lokalita (nadmořská výška): na výše položených zahradách bývá
// jaro opožděné, appka na jaře připomene posunout výsevy citlivých druhů.
const altitudeRule: EcoTipRule = {
  id: 'altitude-spring',
  priority: 3,
  evaluate: (ctx) => {
    const month = ctx.today.getMonth(); // 2,3,4 = březen/duben/květen
    if (month < 2 || month > 4) return null;
    const match = ctx.garden?.elevation?.match(/\d+/);
    const elevation = match ? Number(match[0]) : null;
    if (!elevation || elevation < 500) return null;
    return `Vaše zahrada leží výš (${elevation} m n. m.), takže jaro tam bývá opožděné - s výsevem teplomilných druhů raději počkejte o 1-2 týdny déle než v nížině.`;
  },
};

// Priorita 3 - Sezóna/měsíc: obecný sezónní tip, funguje vždy jako záchranná
// síť, kdyby žádné jiné pravidlo neplatilo.
const seasonalFallbackRule: EcoTipRule = {
  id: 'seasonal-fallback',
  priority: 1,
  evaluate: (ctx) => SEASONAL_ECO_TIPS[ctx.today.getMonth()],
};

const RULES: EcoTipRule[] = [bedHistoryRule, currentPlantMistakeRule, altitudeRule, seasonalFallbackRule];

// Priorita 2 - Úroveň zkušenosti: neovlivňuje, který tip appka vybere,
// jen jemně upraví tón zprávy.
function applyTone(text: string, experienceLevel: Profile['experienceLevel']): string {
  if (experienceLevel === 'zacatecnik') return `Tip pro začátečníky: ${text}`;
  return text;
}

export function pickEcoTip(ctx: EcoTipContext): EcoTipResult {
  const sorted = [...RULES].sort((a, b) => b.priority - a.priority);
  for (const rule of sorted) {
    const text = rule.evaluate(ctx);
    if (text) {
      return { ruleId: rule.id, priority: rule.priority, text: applyTone(text, ctx.profile.experienceLevel) };
    }
  }
  // seasonalFallbackRule je vždy aktivní, sem se tok reálně nikdy nedostane.
  return { ruleId: 'none', priority: 0, text: SEASONAL_ECO_TIPS[ctx.today.getMonth()] };
}
