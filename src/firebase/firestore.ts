import { collection, doc, getDoc, setDoc, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import { Bed, Garden, Harvest, JournalEntry, Membership, PlantingRecord, Task, Tree } from '../types';

// Sdílená zahrada v Cloudu (Firestore struktura):
//   /inviteCodes/{code}            -> { gardenId, ...základní údaje zahrady }
//   /gardens/{gardenId}            -> Garden (bez pole "id", to je název dokumentu)
//   /gardens/{gardenId}/members/{uid} -> Membership
//   /gardens/{gardenId}/beds/{id}, /trees/{id}, /plantings/{id}, /tasks/{id},
//   /gardens/{gardenId}/journal/{id}, /harvests/{id}
//
// inviteCodes/{code} nese kopii základních údajů zahrady schválně - podle
// bezpečnostních pravidel smí /gardens/{gardenId} číst jen její člen, takže
// se přes něj člověk připojující se podle kódu k datům zahrady dostat nemůže
// (a nemusí - stačí mu kopie v inviteCodes).

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bez matoucích 0/O, 1/I

function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export interface GardenContent {
  beds: Bed[];
  trees: Tree[];
  plantings: PlantingRecord[];
  tasks: Task[];
  journal: JournalEntry[];
  harvests: Harvest[];
}

// Založí sdílenou zahradu v Cloudu - použije STEJNÉ id, jaké má zahrada lokálně,
// ať appka dál pracuje s jedním jednotným id bez ohledu na to, kde data reálně leží.
// Zároveň nahraje veškerý dosavadní obsah záhonu (byl-li nějaký), aby ho druhý
// člen po připojení hned uviděl.
export async function shareGardenInCloud(
  garden: Garden,
  ownerUid: string,
  ownerEmail: string,
  content: GardenContent
): Promise<string> {
  const code = generateInviteCode();
  const gardenRef = doc(db, 'gardens', garden.id);
  const basicInfo = {
    name: garden.name,
    location: garden.location,
    lat: garden.lat ?? null,
    lon: garden.lon ?? null,
    elevation: garden.elevation ?? null,
    orientation: garden.orientation ?? null,
    slope: garden.slope ?? null,
    createdAt: garden.createdAt,
    ownerId: ownerUid,
    inviteCode: code,
  };

  await setDoc(gardenRef, basicInfo);
  await setDoc(doc(db, 'inviteCodes', code), { gardenId: garden.id, ...basicInfo });

  const ownerMembership: Membership = {
    uid: ownerUid,
    email: ownerEmail,
    role: 'vlastnik',
    invitedAt: new Date().toISOString(),
    acceptedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'gardens', garden.id, 'members', ownerUid), ownerMembership);

  // Existující obsah nahrajeme v dávkách (Firestore dovolí max. 500 zápisů na dávku).
  const allWrites: { path: string[]; data: unknown }[] = [
    ...content.beds.map((b) => ({ path: ['beds', b.id], data: b })),
    ...content.trees.map((t) => ({ path: ['trees', t.id], data: t })),
    ...content.plantings.map((p) => ({ path: ['plantings', p.id], data: p })),
    ...content.tasks.map((t) => ({ path: ['tasks', t.id], data: t })),
    ...content.journal.map((j) => ({ path: ['journal', j.id], data: j })),
    ...content.harvests.map((h) => ({ path: ['harvests', h.id], data: h })),
  ];
  for (let i = 0; i < allWrites.length; i += 400) {
    const batch = writeBatch(db);
    for (const w of allWrites.slice(i, i + 400)) {
      batch.set(doc(db, 'gardens', garden.id, w.path[0], w.path[1]), w.data as Record<string, unknown>);
    }
    await batch.commit();
  }

  return code;
}

// Připojí přihlášeného uživatele ke sdílené zahradě podle kódu pozvánky.
// Vrací základní data zahrady, ať appka může nový záznam rovnou přidat do
// seznamu "Moje zahrady" a přepnout se na něj.
export async function joinGardenByCode(code: string, uid: string, email: string): Promise<Garden> {
  const codeSnap = await getDoc(doc(db, 'inviteCodes', code.trim().toUpperCase()));
  if (!codeSnap.exists()) {
    throw new Error('invite_code_not_found');
  }
  const data = codeSnap.data() as {
    gardenId: string;
    name: string;
    location: string;
    lat: number | null;
    lon: number | null;
    elevation: string | null;
    orientation: string | null;
    slope: string | null;
    createdAt: string;
    ownerId: string;
    inviteCode: string;
  };
  const gardenId = data.gardenId;

  const membership: Membership = {
    uid,
    email,
    role: 'clen',
    invitedAt: new Date().toISOString(),
    acceptedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'gardens', gardenId, 'members', uid), membership);

  const garden: Garden = {
    id: gardenId,
    name: data.name,
    location: data.location,
    lat: data.lat ?? undefined,
    lon: data.lon ?? undefined,
    elevation: data.elevation ?? undefined,
    orientation: data.orientation ?? undefined,
    slope: data.slope ?? undefined,
    createdAt: data.createdAt,
    shared: true,
    ownerId: data.ownerId,
    inviteCode: data.inviteCode,
  };
  return garden;
}

type CollectionName = 'beds' | 'trees' | 'plantings' | 'tasks' | 'journal' | 'harvests';

// Živě sleduje jednu podsbírku sdílené zahrady - appka se tak dozví o změnách
// od ostatních členů prakticky ihned, bez ručního obnovování.
export function subscribeGardenCollection<T extends { id: string }>(
  gardenId: string,
  collectionName: CollectionName,
  onData: (items: T[]) => void
): () => void {
  const ref = collection(db, 'gardens', gardenId, collectionName);
  return onSnapshot(ref, (snap) => {
    const items = snap.docs.map((d) => ({ ...(d.data() as Omit<T, 'id'>), id: d.id }) as T);
    onData(items);
  });
}

export function subscribeMembers(gardenId: string, onData: (members: Membership[]) => void): () => void {
  const ref = collection(db, 'gardens', gardenId, 'members');
  return onSnapshot(ref, (snap) => {
    onData(snap.docs.map((d) => d.data() as Membership));
  });
}

// merge: true - bezpečné jak pro vytvoření nového dokumentu, tak pro částečnou
// úpravu (např. jen stav úkolu), aniž by přepsalo zbytek dokumentu.
export async function setGardenDoc<T extends object>(
  gardenId: string,
  collectionName: CollectionName,
  docId: string,
  data: T
): Promise<void> {
  await setDoc(doc(db, 'gardens', gardenId, collectionName, docId), data, { merge: true });
}

export async function deleteGardenDoc(gardenId: string, collectionName: CollectionName, docId: string): Promise<void> {
  await deleteDoc(doc(db, 'gardens', gardenId, collectionName, docId));
}

// Kaskádové mazání v Cloudu - zrcadlí stejná pravidla jako lokální verze
// v AppDataContext (viz komentáře tam), jen zapisuje do Firestore dávkou.

export async function deleteBedCascadeCloud(
  gardenId: string,
  bedId: string,
  plantings: PlantingRecord[],
  tasks: Task[],
  journal: JournalEntry[],
  harvests: Harvest[]
): Promise<void> {
  const batch = writeBatch(db);
  const bedPlantingIds = new Set(plantings.filter((p) => p.bedId === bedId).map((p) => p.id));

  for (const p of plantings.filter((p) => p.bedId === bedId)) {
    batch.delete(doc(db, 'gardens', gardenId, 'plantings', p.id));
  }
  for (const t of tasks) {
    if (t.plantingId && bedPlantingIds.has(t.plantingId)) {
      batch.delete(doc(db, 'gardens', gardenId, 'tasks', t.id));
      continue;
    }
    if (t.bedIds.includes(bedId)) {
      const nextBedIds = t.bedIds.filter((id) => id !== bedId);
      if (nextBedIds.length === 0 && t.treeIds.length === 0) {
        batch.delete(doc(db, 'gardens', gardenId, 'tasks', t.id));
      } else {
        batch.update(doc(db, 'gardens', gardenId, 'tasks', t.id), { bedIds: nextBedIds });
      }
    }
  }
  for (const j of journal.filter((j) => j.bedId === bedId)) {
    batch.delete(doc(db, 'gardens', gardenId, 'journal', j.id));
  }
  for (const h of harvests.filter((h) => h.bedId === bedId)) {
    batch.update(doc(db, 'gardens', gardenId, 'harvests', h.id), { bedId: null });
  }
  batch.delete(doc(db, 'gardens', gardenId, 'beds', bedId));
  await batch.commit();
}

export async function deleteTreeCascadeCloud(
  gardenId: string,
  treeId: string,
  tasks: Task[],
  journal: JournalEntry[],
  harvests: Harvest[]
): Promise<void> {
  const batch = writeBatch(db);
  for (const t of tasks) {
    if (t.treeIds.includes(treeId)) {
      const nextTreeIds = t.treeIds.filter((id) => id !== treeId);
      if (nextTreeIds.length === 0 && t.bedIds.length === 0) {
        batch.delete(doc(db, 'gardens', gardenId, 'tasks', t.id));
      } else {
        batch.update(doc(db, 'gardens', gardenId, 'tasks', t.id), { treeIds: nextTreeIds });
      }
    }
  }
  for (const j of journal.filter((j) => j.treeId === treeId)) {
    batch.delete(doc(db, 'gardens', gardenId, 'journal', j.id));
  }
  for (const h of harvests.filter((h) => h.treeId === treeId)) {
    batch.update(doc(db, 'gardens', gardenId, 'harvests', h.id), { treeId: null });
  }
  batch.delete(doc(db, 'gardens', gardenId, 'trees', treeId));
  await batch.commit();
}

export async function deletePlantingCascadeCloud(gardenId: string, plantingId: string, tasks: Task[]): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'gardens', gardenId, 'plantings', plantingId));
  for (const t of tasks.filter((t) => t.plantingId === plantingId)) {
    batch.delete(doc(db, 'gardens', gardenId, 'tasks', t.id));
  }
  await batch.commit();
}
