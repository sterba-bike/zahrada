export type RootStackParamList = {
  Welcome: undefined;
  CreateGarden: undefined;
  AddFirstBed: { gardenId: string };
  Main: undefined;
  BedDetail: { bedId: string };
  TreeDetail: { treeId: string };
  AddBed: undefined;
  AddTree: undefined;
  AddPlant: { bedId: string };
  RecordHarvest: undefined;
  AddTask: undefined;
  Journal: { bedId?: string; treeId?: string; title: string };
  AddJournalEntry: { bedId?: string; treeId?: string; photoOnly?: boolean };
  CompleteTask: undefined;
  ArticleDetail: { articleId: string };
};

export type MainTabParamList = {
  Domů: undefined;
  Zahrada: undefined;
  Kalendář: undefined;
  Eko: undefined;
  Profil: undefined;
};
