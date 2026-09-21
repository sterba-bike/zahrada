// Datový model appky Ekozahrádka (V1 MVP podmnožina dle sekce 4 specifikace).
// V1 pracuje jen s jednou zahradou a jedním lokálním uživatelem (bez sdílení a účtů).

export type ExperienceLevel = 'zacatecnik' | 'stredne_pokrocily' | 'pokrocily';

export interface Profile {
  name: string;
  email: string;
  experienceLevel: ExperienceLevel;
}

export interface Garden {
  id: string;
  name: string;
  location: string;
  elevation?: string;
  orientation?: string;
  slope?: string;
  createdAt: string;
}

export type BedType = 'zeleninovy' | 'bylinkovy' | 'kvetinovy' | 'jiny';

export interface Bed {
  id: string;
  gardenId: string;
  name: string;
  type: BedType;
  foundedAt: string; // založeno
  photoUri?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export type TreeCategory = 'ovocny' | 'okrasny';

export interface Tree {
  id: string;
  gardenId: string;
  name: string;
  category: TreeCategory;
  rootstockType?: string; // typ podnože
  plantedAt: string;
  location?: string;
  status?: string;
  note?: string;
  variety?: string; // odrůda - zatím volný text, do budoucna výběr z nabídky
  photoUri?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export type DifficultyGroup = 'narocna' | 'stredne_narocna' | 'mene_narocna' | 'luskovina';

export const DIFFICULTY_GROUP_LABEL: Record<DifficultyGroup, string> = {
  narocna: 'Náročná',
  stredne_narocna: 'Středně náročná',
  mene_narocna: 'Méně náročná',
  luskovina: 'Luskovina (obohacuje půdu)',
};

export interface BadCompanion {
  speciesId: string;
  reason: string;
}

export interface PlantSpecies {
  id: string;
  name: string;
  difficultyGroup: DifficultyGroup;
  lightNeeds: string;
  waterNeeds: string;
  goodCompanions: string[]; // ids druhů
  badCompanions: BadCompanion[];
  commonMistakes: string;
  source: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface PlantingRecord {
  id: string;
  bedId: string;
  speciesId: string;
  plantedAt: string;
  year: number; // rok osazení - pro kontrolu opakování
  status: string;
  variety?: string; // odrůda - zatím volný text, do budoucna výběr z nabídky
  note?: string;
}

export type TaskType = 'zaliti' | 'hnojeni' | 'sklizen' | 'orez' | 'ochrana' | 'jine';

export interface Task {
  id: string;
  gardenId: string;
  bedId?: string;
  treeId?: string;
  title: string;
  type: TaskType;
  dueDate: string;
  done: boolean;
  doneBy?: string;
  doneAt?: string;
  weatherAdjusted?: boolean;
  adjustReason?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface JournalEntry {
  id: string;
  bedId?: string;
  treeId?: string;
  date: string;
  text: string;
  photoUri?: string;
  lastEditedBy: string;
  lastEditedAt: string;
}

export interface Harvest {
  id: string;
  gardenId: string;
  bedId?: string;
  treeId?: string;
  cropName: string;
  amount: number;
  unit: string;
  date: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  readMinutes: number;
}
