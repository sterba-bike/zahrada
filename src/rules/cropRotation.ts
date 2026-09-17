import { PlantingRecord, PlantSpecies } from '../types';
import { getSpeciesById } from '../data/seedPlants';

const SAME_SPECIES_MIN_GAP_YEARS = 3;

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
    warnings.push({
      kind: 'same_species',
      message: `${newSpecies.name} byl(a) v tomto záhonu naposledy před ${yearsAgo} ${yearsAgo === 1 ? 'rokem' : 'lety'}. Doporučujeme počkat aspoň ${SAME_SPECIES_MIN_GAP_YEARS} roky kvůli chorobám a škůdcům vázaným na tento druh.`,
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
