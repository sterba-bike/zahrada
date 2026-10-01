// Webová verze appky (např. tenhle testovací náhled) - appka data rovnou
// stáhne jako soubor přes standardní prohlížečový mechanismus, bez závislosti
// na expo-file-system/expo-sharing (ty jsou určené pro nativní appku).
export async function saveAndShareJson(filename: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
