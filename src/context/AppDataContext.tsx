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
  addTree: (data: Omit<Tree, 'id' | 'gardenId'>) => Promise<Tree>;
  addPlanting: (data: Omit<PlantingRecord, 'id'>) => Promise<PlantingRecord>;
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

  const addPlanting = useCallback(async (data: Omit<PlantingRecord, 'id'>) => {
    const newPlanting: PlantingRecord = { ...data, id: generateId() };
    setPlantings((prev) => {
      const next = [...prev, newPlanting];
      saveItem(STORAGE_KEYS.plantings, next);
      return next;
    });
    return newPlanting;
  }, []);

  const deletePlanting = useCallback(async (plantingId: string) => {
    setPlantings((prev) => {
      const next = prev.filter((p) => p.id !== plantingId);
      saveItem(STORAGE_KEYS.plantings, next);
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
      addTree,
      addPlanting,
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
      addTree,
      addPlanting,
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
