import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Nativní appka (Expo Go / sestavená appka) - appka soubor uloží do mezipaměti
// appky a otevře systémové "Sdílet" okno, ať si ho uživatel uloží kam chce
// (soubory, e-mail, cloud...). Appka si sama žádnou kopii neponechává natrvalo.
export async function saveAndShareJson(filename: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(json);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('sharing_unavailable');
  }
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Uložit data appky' });
}
