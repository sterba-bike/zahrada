export type RootStackParamList = {
  Welcome: undefined;
  CreateGarden: undefined;
  AddFirstBed: { gardenId: string };
  Main: undefined;
  RecordHarvest: undefined;
  AddTask: undefined;
  AddJournalEntry: { bedId?: string; treeId?: string; photoOnly?: boolean };
  CompleteTask: undefined;
};

export type MainTabParamList = {
  Domů: undefined;
  Zahrada: undefined;
  Kalendář: undefined;
  Eko: undefined;
  Profil: undefined;
};

// Vlastní stack v záložce Zahrada - obrazovky uvnitř zůstávají "pod" spodní
// lištou, takže je vidět po celou dobu (jde kdykoli přeskočit na jinou záložku).
export type ZahradaStackParamList = {
  GardenDetail: undefined;
  BedDetail: { bedId: string };
  TreeDetail: { treeId: string };
  AddBed: undefined;
  AddTree: undefined;
  AddPlant: { bedId: string };
  EditPlant: { plantingId: string };
  Journal: { bedId?: string; treeId?: string; title: string };
};

// Vlastní stack v záložce Eko - ze stejného důvodu jako u Zahrady.
export type EkoStackParamList = {
  EkoHome: undefined;
  ArticleDetail: { articleId: string };
};
