import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { generateId, loadItem, saveItem, STORAGE_KEYS } from '../data/storage';
import { useAuth } from './AuthContext';
import {
  shareGardenInCloud,
  joinGardenByCode,
  subscribeGardenCollection,
  subscribeMembers,
  setGardenDoc,
  deleteBedCascadeCloud,
  deleteTreeCascadeCloud,
  deletePlantingCascadeCloud,
} from '../firebase/firestore';
import {
  Bed,
  Garden,
  Harvest,
  JournalEntry,
  Membership,
  PhotoDiagnosis,
  PlantingRecord,
  Profile,
  Task,
  Tree,
} from '../types';

const DEFAULT_PROFILE: Profile = {
  name: 'Já',
  email: '',
  experienceLevel: 'zacatecnik',
};

interface AppDataState {
  loading: boolean;
  gardens: Garden[];
  activeGardenId: string | null;
  garden: Garden | null;
  beds: Bed[];
  trees: Tree[];
  plantings: PlantingRecord[];
  tasks: Task[];
  journal: JournalEntry[];
  harvests: Harvest[];
  members: Membership[];
  photoDiagnoses: PhotoDiagnosis[];
  profile: Profile;
}

interface AppDataActions {
  createGarden: (data: Pick<Garden, 'name' | 'location'> & Partial<Garden>) => Promise<Garden>;
  switchGarden: (gardenId: string) => Promise<void>;
  updateGarden: (gardenId: string, data: Partial<Pick<Garden, 'lat' | 'lon'>>) => Promise<void>;
  shareGarden: () => Promise<string>;
  joinGarden: (code: string) => Promise<void>;
  addBed: (data: Omit<Bed, 'id' | 'gardenId'>) => Promise<Bed>;
  deleteBed: (bedId: string) => Promise<void>;
  addTree: (data: Omit<Tree, 'id' | 'gardenId'>) => Promise<Tree>;
  deleteTree: (treeId: string) => Promise<void>;
  addPlanting: (data: Omit<PlantingRecord, 'id'>) => Promise<PlantingRecord>;
  updatePlanting: (
    plantingId: string,
    data: Pick<PlantingRecord, 'plantedAt' | 'year' | 'status' | 'variety' | 'varietyEarliness' | 'note'>
  ) => Promise<void>;
  deletePlanting: (plantingId: string) => Promise<void>;
  addTask: (data: Omit<Task, 'id' | 'done'>) => Promise<Task>;
  completeTask: (taskId: string) => Promise<void>;
  addJournalEntry: (data: Omit<JournalEntry, 'id' | 'lastEditedBy' | 'lastEditedAt'>) => Promise<JournalEntry>;
  addHarvest: (data: Omit<Harvest, 'id'>) => Promise<Harvest>;
  addPhotoDiagnosis: (data: Omit<PhotoDiagnosis, 'id' | 'date'>) => Promise<PhotoDiagnosis>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  bedHistory: (bedId: string) => PlantingRecord[];
}

const AppDataContext = createContext<(AppDataState & AppDataActions) | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [activeGardenId, setActiveGardenId] = useState<string | null>(null);
  const garden = gardens.find((g) => g.id === activeGardenId) ?? null;
  const [beds, setBeds] = useState<Bed[]>([]);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [plantings, setPlantings] = useState<PlantingRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [photoDiagnoses, setPhotoDiagnoses] = useState<PhotoDiagnosis[]>([]);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const { user } = useAuth();

  // Obsah sdílené zahrady neleží v AsyncStorage, ale ve Firestore - appka ho
  // živě sleduje (onSnapshot), dokud je daná sdílená zahrada aktivní.
  const [cloudBeds, setCloudBeds] = useState<Bed[]>([]);
  const [cloudTrees, setCloudTrees] = useState<Tree[]>([]);
  const [cloudPlantings, setCloudPlantings] = useState<PlantingRecord[]>([]);
  const [cloudTasks, setCloudTasks] = useState<Task[]>([]);
  const [cloudJournal, setCloudJournal] = useState<JournalEntry[]>([]);
  const [cloudHarvests, setCloudHarvests] = useState<Harvest[]>([]);
  const [cloudMembers, setCloudMembers] = useState<Membership[]>([]);

  useEffect(() => {
    if (!garden?.shared) {
      setCloudBeds([]);
      setCloudTrees([]);
      setCloudPlantings([]);
      setCloudTasks([]);
      setCloudJournal([]);
      setCloudHarvests([]);
      setCloudMembers([]);
      return;
    }
    const gardenId = garden.id;
    const unsubscribers = [
      subscribeGardenCollection<Bed>(gardenId, 'beds', setCloudBeds),
      subscribeGardenCollection<Tree>(gardenId, 'trees', setCloudTrees),
      subscribeGardenCollection<PlantingRecord>(gardenId, 'plantings', setCloudPlantings),
      subscribeGardenCollection<Task>(gardenId, 'tasks', setCloudTasks),
      subscribeGardenCollection<JournalEntry>(gardenId, 'journal', setCloudJournal),
      subscribeGardenCollection<Harvest>(gardenId, 'harvests', setCloudHarvests),
      subscribeMembers(gardenId, setCloudMembers),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [garden?.id, garden?.shared]);

  // Zdroj pravdy pro obsah aktivní zahrady - lokální AsyncStorage data, nebo
  // živá Firestore data, podle toho, jestli je zahrada sdílená.
  const activeBeds = garden?.shared ? cloudBeds : beds.filter((b) => b.gardenId === activeGardenId);
  const activeTrees = garden?.shared ? cloudTrees : trees.filter((t) => t.gardenId === activeGardenId);
  const activeTasks = garden?.shared ? cloudTasks : tasks.filter((t) => t.gardenId === activeGardenId);
  const activeHarvests = garden?.shared ? cloudHarvests : harvests.filter((h) => h.gardenId === activeGardenId);
  const activePlantings = garden?.shared ? cloudPlantings : plantings;
  const activeJournal = garden?.shared ? cloudJournal : journal;

  useEffect(() => {
    (async () => {
      let [loadedGardens, loadedActiveId, b, t, p, tk, j, h, pd, pr] = await Promise.all([
        loadItem<Garden[]>(STORAGE_KEYS.gardens, []),
        loadItem<string | null>(STORAGE_KEYS.activeGardenId, null),
        loadItem<Bed[]>(STORAGE_KEYS.beds, []),
        loadItem<Tree[]>(STORAGE_KEYS.trees, []),
        loadItem<PlantingRecord[]>(STORAGE_KEYS.plantings, []),
        loadItem<Task[]>(STORAGE_KEYS.tasks, []),
        loadItem<JournalEntry[]>(STORAGE_KEYS.journal, []),
        loadItem<Harvest[]>(STORAGE_KEYS.harvests, []),
        loadItem<PhotoDiagnosis[]>(STORAGE_KEYS.photoDiagnoses, []),
        loadItem<Profile>(STORAGE_KEYS.profile, DEFAULT_PROFILE),
      ]);

      // Migrace z V1 (appka pracovala jen s jednou zahradou pod jiným klíčem).
      if (loadedGardens.length === 0) {
        const legacyGarden = await loadItem<Garden | null>(STORAGE_KEYS.garden, null);
        if (legacyGarden) {
          loadedGardens = [legacyGarden];
          loadedActiveId = legacyGarden.id;
          await saveItem(STORAGE_KEYS.gardens, loadedGardens);
          await saveItem(STORAGE_KEYS.activeGardenId, loadedActiveId);
        }
      }
      if (!loadedActiveId && loadedGardens.length > 0) {
        loadedActiveId = loadedGardens[0].id;
      }

      setGardens(loadedGardens);
      setActiveGardenId(loadedActiveId);
      setBeds(b);
      setTrees(t);
      setPlantings(p);
      setTasks(tk);
      setJournal(j);
      setHarvests(h);
      setPhotoDiagnoses(pd);
      setProfile(pr);
      setLoading(false);
    })();
  }, []);

  // Zakládá novou zahradu (při úvodním nastavení i při přidání další) a rovnou ji přepne jako aktivní.
  const createGarden = useCallback(async (data: Pick<Garden, 'name' | 'location'> & Partial<Garden>) => {
    const newGarden: Garden = {
      id: generateId(),
      name: data.name,
      location: data.location,
      elevation: data.elevation,
      orientation: data.orientation,
      slope: data.slope,
      createdAt: new Date().toISOString(),
    };
    setGardens((prev) => {
      const next = [...prev, newGarden];
      saveItem(STORAGE_KEYS.gardens, next);
      return next;
    });
    setActiveGardenId(newGarden.id);
    await saveItem(STORAGE_KEYS.activeGardenId, newGarden.id);
    return newGarden;
  }, []);

  const switchGarden = useCallback(async (gardenId: string) => {
    setActiveGardenId(gardenId);
    await saveItem(STORAGE_KEYS.activeGardenId, gardenId);
  }, []);

  // Zatím jen pro doplnění souřadnic dopočtených appkou z lokality (pro dotaz na počasí).
  const updateGarden = useCallback(async (gardenId: string, data: Partial<Pick<Garden, 'lat' | 'lon'>>) => {
    setGardens((prev) => {
      const next = prev.map((g) => (g.id === gardenId ? { ...g, ...data } : g));
      saveItem(STORAGE_KEYS.gardens, next);
      return next;
    });
  }, []);

  // Přepne aktivní zahradu z čistě lokální na sdílenou - nahraje dosavadní
  // obsah do Firestore a vrátí kód pozvánky pro ostatní členy.
  const shareGarden = useCallback(async () => {
    if (!garden) throw new Error('no_active_garden');
    if (!user) throw new Error('not_signed_in');

    const gardenBedIds = new Set(beds.filter((b) => b.gardenId === garden.id).map((b) => b.id));
    const gardenTreeIds = new Set(trees.filter((t) => t.gardenId === garden.id).map((t) => t.id));
    const content = {
      beds: beds.filter((b) => b.gardenId === garden.id),
      trees: trees.filter((t) => t.gardenId === garden.id),
      plantings: plantings.filter((p) => gardenBedIds.has(p.bedId)),
      tasks: tasks.filter((t) => t.gardenId === garden.id),
      journal: journal.filter((j) => (j.bedId && gardenBedIds.has(j.bedId)) || (j.treeId && gardenTreeIds.has(j.treeId))),
      harvests: harvests.filter((h) => h.gardenId === garden.id),
    };

    const code = await shareGardenInCloud(garden, user.uid, user.email ?? '', content);
    const updatedGarden: Garden = { ...garden, shared: true, ownerId: user.uid, inviteCode: code };
    setGardens((prev) => {
      const next = prev.map((g) => (g.id === garden.id ? updatedGarden : g));
      saveItem(STORAGE_KEYS.gardens, next);
      return next;
    });

    // Lokální kopie appka po přepnutí na cloud dál nepotřebuje - smaže je,
    // ať nevznikne duplicita mezi lokálními daty a Firestore.
    setBeds((prev) => {
      const next = prev.filter((b) => b.gardenId !== garden.id);
      saveItem(STORAGE_KEYS.beds, next);
      return next;
    });
    setTrees((prev) => {
      const next = prev.filter((t) => t.gardenId !== garden.id);
      saveItem(STORAGE_KEYS.trees, next);
      return next;
    });
    setTasks((prev) => {
      const next = prev.filter((t) => t.gardenId !== garden.id);
      saveItem(STORAGE_KEYS.tasks, next);
      return next;
    });
    setHarvests((prev) => {
      const next = prev.filter((h) => h.gardenId !== garden.id);
      saveItem(STORAGE_KEYS.harvests, next);
      return next;
    });
    setPlantings((prev) => {
      const next = prev.filter((p) => !gardenBedIds.has(p.bedId));
      saveItem(STORAGE_KEYS.plantings, next);
      return next;
    });
    setJournal((prev) => {
      const next = prev.filter((j) => !((j.bedId && gardenBedIds.has(j.bedId)) || (j.treeId && gardenTreeIds.has(j.treeId))));
      saveItem(STORAGE_KEYS.journal, next);
      return next;
    });

    return code;
  }, [garden, user, beds, trees, plantings, tasks, journal, harvests]);

  // Připojí přihlášeného uživatele ke sdílené zahradě podle kódu pozvánky.
  const joinGarden = useCallback(
    async (code: string) => {
      if (!user) throw new Error('not_signed_in');
      const joined = await joinGardenByCode(code, user.uid, user.email ?? '');
      setGardens((prev) => {
        if (prev.some((g) => g.id === joined.id)) return prev;
        const next = [...prev, joined];
        saveItem(STORAGE_KEYS.gardens, next);
        return next;
      });
      setActiveGardenId(joined.id);
      await saveItem(STORAGE_KEYS.activeGardenId, joined.id);
    },
    [user]
  );

  const addBed = useCallback(
    async (data: Omit<Bed, 'id' | 'gardenId'>) => {
      const newBed: Bed = {
        ...data,
        id: generateId(),
        gardenId: garden?.id ?? '',
        lastEditedBy: profile.name,
        lastEditedAt: new Date().toISOString(),
      };
      if (garden?.shared) {
        await setGardenDoc(garden.id, 'beds', newBed.id, newBed);
        return newBed;
      }
      setBeds((prev) => {
        const next = [...prev, newBed];
        saveItem(STORAGE_KEYS.beds, next);
        return next;
      });
      return newBed;
    },
    [garden, profile.name]
  );

  const deleteBed = useCallback(
    async (bedId: string) => {
      if (garden?.shared) {
        await deleteBedCascadeCloud(garden.id, bedId, activePlantings, activeTasks, activeJournal, activeHarvests);
        return;
      }

      const bedPlantingIds = new Set(plantings.filter((p) => p.bedId === bedId).map((p) => p.id));

      setPlantings((prev) => {
        const next = prev.filter((p) => p.bedId !== bedId);
        saveItem(STORAGE_KEYS.plantings, next);
        return next;
      });

      setTasks((prev) => {
        const next = prev
          .filter((t) => !(t.plantingId && bedPlantingIds.has(t.plantingId)))
          .map((t) => (t.bedIds.includes(bedId) ? { ...t, bedIds: t.bedIds.filter((id) => id !== bedId) } : t))
          .filter((t) => t.bedIds.length > 0 || t.treeIds.length > 0);
        saveItem(STORAGE_KEYS.tasks, next);
        return next;
      });

      setJournal((prev) => {
        const next = prev.filter((e) => e.bedId !== bedId);
        saveItem(STORAGE_KEYS.journal, next);
        return next;
      });

      // Sklizeň se nemaže (počítá se do Přehledu sklizně za celou zahradu),
      // jen se odpojí vazba na smazaný záhon.
      setHarvests((prev) => {
        const next = prev.map((h) => (h.bedId === bedId ? { ...h, bedId: undefined } : h));
        saveItem(STORAGE_KEYS.harvests, next);
        return next;
      });

      setBeds((prev) => {
        const next = prev.filter((b) => b.id !== bedId);
        saveItem(STORAGE_KEYS.beds, next);
        return next;
      });
    },
    [garden, plantings, activePlantings, activeTasks, activeJournal, activeHarvests]
  );

  const addTree = useCallback(
    async (data: Omit<Tree, 'id' | 'gardenId'>) => {
      const newTree: Tree = {
        ...data,
        id: generateId(),
        gardenId: garden?.id ?? '',
        lastEditedBy: profile.name,
        lastEditedAt: new Date().toISOString(),
      };
      if (garden?.shared) {
        await setGardenDoc(garden.id, 'trees', newTree.id, newTree);
        return newTree;
      }
      setTrees((prev) => {
        const next = [...prev, newTree];
        saveItem(STORAGE_KEYS.trees, next);
        return next;
      });
      return newTree;
    },
    [garden, profile.name]
  );

  const deleteTree = useCallback(
    async (treeId: string) => {
      if (garden?.shared) {
        await deleteTreeCascadeCloud(garden.id, treeId, activeTasks, activeJournal, activeHarvests);
        return;
      }

      setTasks((prev) => {
        const next = prev
          .map((t) => (t.treeIds.includes(treeId) ? { ...t, treeIds: t.treeIds.filter((id) => id !== treeId) } : t))
          .filter((t) => t.bedIds.length > 0 || t.treeIds.length > 0);
        saveItem(STORAGE_KEYS.tasks, next);
        return next;
      });

      setJournal((prev) => {
        const next = prev.filter((e) => e.treeId !== treeId);
        saveItem(STORAGE_KEYS.journal, next);
        return next;
      });

      // Sklizeň se nemaže (počítá se do Přehledu sklizně za celou zahradu),
      // jen se odpojí vazba na smazaný strom/keř.
      setHarvests((prev) => {
        const next = prev.map((h) => (h.treeId === treeId ? { ...h, treeId: undefined } : h));
        saveItem(STORAGE_KEYS.harvests, next);
        return next;
      });

      setTrees((prev) => {
        const next = prev.filter((t) => t.id !== treeId);
        saveItem(STORAGE_KEYS.trees, next);
        return next;
      });
    },
    [garden, activeTasks, activeJournal, activeHarvests]
  );

  const addPlanting = useCallback(
    async (data: Omit<PlantingRecord, 'id'>) => {
      const newPlanting: PlantingRecord = { ...data, id: generateId() };
      if (garden?.shared) {
        await setGardenDoc(garden.id, 'plantings', newPlanting.id, newPlanting);
        return newPlanting;
      }
      setPlantings((prev) => {
        const next = [...prev, newPlanting];
        saveItem(STORAGE_KEYS.plantings, next);
        return next;
      });
      return newPlanting;
    },
    [garden]
  );

  const updatePlanting = useCallback(
    async (
      plantingId: string,
      data: Pick<PlantingRecord, 'plantedAt' | 'year' | 'status' | 'variety' | 'varietyEarliness' | 'note'>
    ) => {
      if (garden?.shared) {
        await setGardenDoc(garden.id, 'plantings', plantingId, data);
        return;
      }
      setPlantings((prev) => {
        const next = prev.map((p) => (p.id === plantingId ? { ...p, ...data } : p));
        saveItem(STORAGE_KEYS.plantings, next);
        return next;
      });
    },
    [garden]
  );

  // Smaže rostlinu i úkoly, které pro ni appka sama navrhla (viz plantingId v AddPlantScreen).
  const deletePlanting = useCallback(
    async (plantingId: string) => {
      if (garden?.shared) {
        await deletePlantingCascadeCloud(garden.id, plantingId, activeTasks);
        return;
      }
      setPlantings((prev) => {
        const next = prev.filter((p) => p.id !== plantingId);
        saveItem(STORAGE_KEYS.plantings, next);
        return next;
      });
      setTasks((prev) => {
        const next = prev.filter((t) => t.plantingId !== plantingId);
        saveItem(STORAGE_KEYS.tasks, next);
        return next;
      });
    },
    [garden, activeTasks]
  );

  const addTask = useCallback(
    async (data: Omit<Task, 'id' | 'done'>) => {
      const newTask: Task = { ...data, id: generateId(), done: false };
      if (garden?.shared) {
        await setGardenDoc(garden.id, 'tasks', newTask.id, newTask);
        return newTask;
      }
      setTasks((prev) => {
        const next = [...prev, newTask];
        saveItem(STORAGE_KEYS.tasks, next);
        return next;
      });
      return newTask;
    },
    [garden]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      const doneData = { done: true, doneBy: profile.name, doneAt: new Date().toISOString() };
      if (garden?.shared) {
        await setGardenDoc(garden.id, 'tasks', taskId, doneData);
        return;
      }
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === taskId ? { ...t, ...doneData } : t));
        saveItem(STORAGE_KEYS.tasks, next);
        return next;
      });
    },
    [garden, profile.name]
  );

  const addJournalEntry = useCallback(
    async (data: Omit<JournalEntry, 'id' | 'lastEditedBy' | 'lastEditedAt'>) => {
      const newEntry: JournalEntry = {
        ...data,
        id: generateId(),
        lastEditedBy: profile.name,
        lastEditedAt: new Date().toISOString(),
      };
      if (garden?.shared) {
        await setGardenDoc(garden.id, 'journal', newEntry.id, newEntry);
        return newEntry;
      }
      setJournal((prev) => {
        const next = [newEntry, ...prev];
        saveItem(STORAGE_KEYS.journal, next);
        return next;
      });
      return newEntry;
    },
    [garden, profile.name]
  );

  const addHarvest = useCallback(
    async (data: Omit<Harvest, 'id'>) => {
      const newHarvest: Harvest = { ...data, id: generateId() };
      if (garden?.shared) {
        await setGardenDoc(garden.id, 'harvests', newHarvest.id, newHarvest);
        return newHarvest;
      }
      setHarvests((prev) => {
        const next = [newHarvest, ...prev];
        saveItem(STORAGE_KEYS.harvests, next);
        return next;
      });
      return newHarvest;
    },
    [garden]
  );

  // Zůstává lokální i pro sdílené zahrady - jde o osobní odhad ze zařízení,
  // sdílení mezi členy zahrady zatím spec nevyžaduje.
  const addPhotoDiagnosis = useCallback(async (data: Omit<PhotoDiagnosis, 'id' | 'date'>) => {
    const newDiagnosis: PhotoDiagnosis = { ...data, id: generateId(), date: new Date().toISOString() };
    setPhotoDiagnoses((prev) => {
      const next = [newDiagnosis, ...prev];
      saveItem(STORAGE_KEYS.photoDiagnoses, next);
      return next;
    });
    return newDiagnosis;
  }, []);

  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...data };
      saveItem(STORAGE_KEYS.profile, next);
      return next;
    });
  }, []);

  const bedHistory = useCallback(
    (bedId: string) => activePlantings.filter((p) => p.bedId === bedId),
    [activePlantings]
  );

  const value = useMemo(
    () => ({
      loading,
      gardens,
      activeGardenId,
      garden,
      beds: activeBeds,
      trees: activeTrees,
      plantings: activePlantings,
      tasks: activeTasks,
      journal: activeJournal,
      harvests: activeHarvests,
      members: cloudMembers,
      photoDiagnoses,
      profile,
      createGarden,
      switchGarden,
      updateGarden,
      shareGarden,
      joinGarden,
      addBed,
      deleteBed,
      addTree,
      deleteTree,
      addPlanting,
      updatePlanting,
      deletePlanting,
      addTask,
      completeTask,
      addJournalEntry,
      addHarvest,
      addPhotoDiagnosis,
      updateProfile,
      bedHistory,
    }),
    [
      loading,
      gardens,
      activeGardenId,
      garden,
      activeBeds,
      activeTrees,
      activePlantings,
      activeTasks,
      activeJournal,
      activeHarvests,
      cloudMembers,
      photoDiagnoses,
      profile,
      createGarden,
      switchGarden,
      updateGarden,
      shareGarden,
      joinGarden,
      addBed,
      deleteBed,
      addTree,
      deleteTree,
      addPlanting,
      updatePlanting,
      deletePlanting,
      addTask,
      completeTask,
      addJournalEntry,
      addHarvest,
      addPhotoDiagnosis,
      updateProfile,
      bedHistory,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData musí být použito uvnitř AppDataProvider');
  return ctx;
}
