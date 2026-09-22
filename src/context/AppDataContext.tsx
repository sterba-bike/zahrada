import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { generateId, loadItem, saveItem, STORAGE_KEYS } from '../data/storage';
import {
  Bed,
  Garden,
  Harvest,
  JournalEntry,
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
  garden: Garden | null;
  beds: Bed[];
  trees: Tree[];
  plantings: PlantingRecord[];
  tasks: Task[];
  journal: JournalEntry[];
  harvests: Harvest[];
  profile: Profile;
}

interface AppDataActions {
  createGarden: (data: Pick<Garden, 'name' | 'location'> & Partial<Garden>) => Promise<Garden>;
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
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  bedHistory: (bedId: string) => PlantingRecord[];
}

const AppDataContext = createContext<(AppDataState & AppDataActions) | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [garden, setGarden] = useState<Garden | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [plantings, setPlantings] = useState<PlantingRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    (async () => {
      const [g, b, t, p, tk, j, h, pr] = await Promise.all([
        loadItem<Garden | null>(STORAGE_KEYS.garden, null),
        loadItem<Bed[]>(STORAGE_KEYS.beds, []),
        loadItem<Tree[]>(STORAGE_KEYS.trees, []),
        loadItem<PlantingRecord[]>(STORAGE_KEYS.plantings, []),
        loadItem<Task[]>(STORAGE_KEYS.tasks, []),
        loadItem<JournalEntry[]>(STORAGE_KEYS.journal, []),
        loadItem<Harvest[]>(STORAGE_KEYS.harvests, []),
        loadItem<Profile>(STORAGE_KEYS.profile, DEFAULT_PROFILE),
      ]);
      setGarden(g);
      setBeds(b);
      setTrees(t);
      setPlantings(p);
      setTasks(tk);
      setJournal(j);
      setHarvests(h);
      setProfile(pr);
      setLoading(false);
    })();
  }, []);

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
    setGarden(newGarden);
    await saveItem(STORAGE_KEYS.garden, newGarden);
    return newGarden;
  }, []);

  const addBed = useCallback(
    async (data: Omit<Bed, 'id' | 'gardenId'>) => {
      const newBed: Bed = {
        ...data,
        id: generateId(),
        gardenId: garden?.id ?? '',
        lastEditedBy: profile.name,
        lastEditedAt: new Date().toISOString(),
      };
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

      setBeds((prev) => {
        const next = prev.filter((b) => b.id !== bedId);
        saveItem(STORAGE_KEYS.beds, next);
        return next;
      });
    },
    [plantings]
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
      setTrees((prev) => {
        const next = [...prev, newTree];
        saveItem(STORAGE_KEYS.trees, next);
        return next;
      });
      return newTree;
    },
    [garden, profile.name]
  );

  const deleteTree = useCallback(async (treeId: string) => {
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

    setTrees((prev) => {
      const next = prev.filter((t) => t.id !== treeId);
      saveItem(STORAGE_KEYS.trees, next);
      return next;
    });
  }, []);

  const addPlanting = useCallback(async (data: Omit<PlantingRecord, 'id'>) => {
    const newPlanting: PlantingRecord = { ...data, id: generateId() };
    setPlantings((prev) => {
      const next = [...prev, newPlanting];
      saveItem(STORAGE_KEYS.plantings, next);
      return next;
    });
    return newPlanting;
  }, []);

  const updatePlanting = useCallback(
    async (
      plantingId: string,
      data: Pick<PlantingRecord, 'plantedAt' | 'year' | 'status' | 'variety' | 'varietyEarliness' | 'note'>
    ) => {
      setPlantings((prev) => {
        const next = prev.map((p) => (p.id === plantingId ? { ...p, ...data } : p));
        saveItem(STORAGE_KEYS.plantings, next);
        return next;
      });
    },
    []
  );

  // Smaže rostlinu i úkoly, které pro ni appka sama navrhla (viz plantingId v AddPlantScreen).
  const deletePlanting = useCallback(async (plantingId: string) => {
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
  }, []);

  const addTask = useCallback(async (data: Omit<Task, 'id' | 'done'>) => {
    const newTask: Task = { ...data, id: generateId(), done: false };
    setTasks((prev) => {
      const next = [...prev, newTask];
      saveItem(STORAGE_KEYS.tasks, next);
      return next;
    });
    return newTask;
  }, []);

  const completeTask = useCallback(
    async (taskId: string) => {
      setTasks((prev) => {
        const next = prev.map((t) =>
          t.id === taskId
            ? { ...t, done: true, doneBy: profile.name, doneAt: new Date().toISOString() }
            : t
        );
        saveItem(STORAGE_KEYS.tasks, next);
        return next;
      });
    },
    [profile.name]
  );

  const addJournalEntry = useCallback(
    async (data: Omit<JournalEntry, 'id' | 'lastEditedBy' | 'lastEditedAt'>) => {
      const newEntry: JournalEntry = {
        ...data,
        id: generateId(),
        lastEditedBy: profile.name,
        lastEditedAt: new Date().toISOString(),
      };
      setJournal((prev) => {
        const next = [newEntry, ...prev];
        saveItem(STORAGE_KEYS.journal, next);
        return next;
      });
      return newEntry;
    },
    [profile.name]
  );

  const addHarvest = useCallback(async (data: Omit<Harvest, 'id'>) => {
    const newHarvest: Harvest = { ...data, id: generateId() };
    setHarvests((prev) => {
      const next = [newHarvest, ...prev];
      saveItem(STORAGE_KEYS.harvests, next);
      return next;
    });
    return newHarvest;
  }, []);

  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...data };
      saveItem(STORAGE_KEYS.profile, next);
      return next;
    });
  }, []);

  const bedHistory = useCallback(
    (bedId: string) => plantings.filter((p) => p.bedId === bedId),
    [plantings]
  );

  const value = useMemo(
    () => ({
      loading,
      garden,
      beds,
      trees,
      plantings,
      tasks,
      journal,
      harvests,
      profile,
      createGarden,
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
      updateProfile,
      bedHistory,
    }),
    [
      loading,
      garden,
      beds,
      trees,
      plantings,
      tasks,
      journal,
      harvests,
      profile,
      createGarden,
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
