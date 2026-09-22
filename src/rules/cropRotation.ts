import { DifficultyGroup, PlantingRecord, PlantSpecies } from '../types';
import { getSpeciesById, SEED_PLANT_SPECIES } from '../data/seedPlants';

export const SAME_SPECIES_MIN_GAP_YEARS = 3;

export interface RotationWarning {
  kind: 'same_species' | 'same_difficulty_group';
  message: string;
}

// Pravidlo 5.1: kontroluje historii osetí záhonu (min. 4 roky) proti nově
// přidávanému druhu - nezávisle na sobě hlídá opakování stejného druhu do 3 let
// a opakování stejné skupiny náročnosti oproti bezprostředně předchozí sezóně.
export function checkCropRotation(
  bedHistory: PlantingRecord[],
  newSpecies: PlantSpecies,
  newYear: number
): RotationWarning[] {
  const warnings: RotationWarning[] = [];

  const sameSpeciesRecent = bedHistory.find(
    (p) => p.speciesId === newSpecies.id && newYear - p.year < SAME_SPECIES_MIN_GAP_YEARS && newYear - p.year >= 0
  );
  if (sameSpeciesRecent) {
    const yearsAgo = newYear - sameSpeciesRecent.year;
    const whenText =
      yearsAgo === 0 ? 'už letos' : `naposledy před ${yearsAgo} ${yearsAgo === 1 ? 'rokem' : 'lety'}`;
    warnings.push({
      kind: 'same_species',
      message: `${newSpecies.name} byl(a) v tomto záhonu ${whenText}. Doporučujeme počkat aspoň ${SAME_SPECIES_MIN_GAP_YEARS} roky kvůli chorobám a škůdcům vázaným na tento druh.`,
    });
  }

  const previousSeasonYear = newYear - 1;
  const previousSeasonPlantings = bedHistory.filter((p) => p.year === previousSeasonYear);
  const previousGroupSame = previousSeasonPlantings.some((p) => {
    const species = getSpeciesById(p.speciesId);
    return species && species.difficultyGroup === newSpecies.difficultyGroup && newSpecies.difficultyGroup !== 'luskovina';
  });
  if (previousGroupSame) {
    warnings.push({
      kind: 'same_difficulty_group',
      message: `Minulou sezónu tu rostla rostlina ze stejné skupiny náročnosti (${newSpecies.difficultyGroup === 'narocna' ? 'náročná' : 'středně náročná'}). Půda po ní potřebuje odpočinek - zvažte luskoviny nebo jinou skupinu.`,
    });
  }

  return warnings;
}

export interface PlantingRecommendation {
  lastYearGroups: DifficultyGroup[];
  avoidGroups: DifficultyGroup[];
  recommendedGroups: DifficultyGroup[];
  avoidSpeciesIds: string[];
  suggestedSpecies: PlantSpecies[];
}

// Aktivní doporučení pro příští osetí v detailu záhonu (spec sekce 3, "Detail
// záhonu"): na základě až 4leté historie navrhne vhodnou skupinu náročnosti
// a pár konkrétních druhů - stejná pravidla jako 5.1/5.2, jen aktivně navrhují
// místo pasivního varování při výběru konkrétní rostliny.
export function recommendNextPlanting(bedHistory: PlantingRecord[], currentYear: number): PlantingRecommendation {
  const lastYearPlantings = bedHistory.filter((p) => p.year === currentYear - 1);
  const lastYearGroups = Array.from(
    new Set(
      lastYearPlantings
        .map((p) => getSpeciesById(p.speciesId)?.difficultyGroup)
        .filter((g): g is DifficultyGroup => !!g)
    )
  );
  // Luskoviny půdu obohacují, takže se nikdy nepovažují za skupinu k vynechání.
  const avoidGroups: DifficultyGroup[] = lastYearGroups.filter((g) => g !== 'luskovina');

  const allGroups: DifficultyGroup[] = ['luskovina', 'mene_narocna', 'stredne_narocna', 'narocna'];
  const recommendedGroups =
    avoidGroups.length === 0 ? allGroups : allGroups.filter((g) => !avoidGroups.includes(g));

  const avoidSpeciesIds = Array.from(
    new Set(
      bedHistory
        .filter((p) => currentYear - p.year < SAME_SPECIES_MIN_GAP_YEARS && currentYear - p.year >= 0)
        .map((p) => p.speciesId)
    )
  );

  const currentlyGrowingIds = bedHistory
    .filter((p) => p.year === currentYear && p.status.trim().toLowerCase() === 'roste')
    .map((p) => p.speciesId);

  const suggestedSpecies = SEED_PLANT_SPECIES.filter((species) => {
    if (!recommendedGroups.includes(species.difficultyGroup)) return false;
    if (avoidSpeciesIds.includes(species.id)) return false;
    const clashesWithCurrent = currentlyGrowingIds.some((growingId) =>
      species.badCompanions.some((b) => b.speciesId === growingId)
    );
    return !clashesWithCurrent;
  }).slice(0, 6);

  return { lastYearGroups, avoidGroups, recommendedGroups, avoidSpeciesIds, suggestedSpecies };
}

export interface CompanionWarning {
  otherSpeciesId: string;
  otherSpeciesName: string;
  reason: string;
}

// Pravidlo 5.2: kontroluje novou rostlinu proti tomu, co už v záhonu roste
// (existingSpeciesIds), i proti ostatním rostlinám vybíraným ve stejném kroku.
export function checkCompanionPlanting(
  newSpecies: PlantSpecies,
  otherSpeciesIdsInBed: string[]
): CompanionWarning[] {
  const warnings: CompanionWarning[] = [];
  for (const otherId of otherSpeciesIdsInBed) {
    if (otherId === newSpecies.id) continue;
    const bad = newSpecies.badCompanions.find((b) => b.speciesId === otherId);
    if (bad) {
      const other = getSpeciesById(otherId);
      warnings.push({
        otherSpeciesId: otherId,
        otherSpeciesName: other?.name ?? otherId,
        reason: bad.reason,
      });
    }
  }
  return warnings;
}
