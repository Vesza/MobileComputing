// Expo FileSystem wird genutzt, um Bilder lokal in der App-Directory zu speichern.
import * as FileSystem from "expo-file-system/legacy"; 

// Zielordner für Bild-Dateien innerhalb des App-Speichers.
const IMG_DIR = FileSystem.documentDirectory + "images/";

// Stellt sicher, dass der Zielordner existiert.
// Falls nicht vorhanden, wird er inkl. Zwischenordnern angelegt.
async function ensureDir() {
  const dirInfo = await FileSystem.getInfoAsync(IMG_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true });
  }
}

// Kopiert ein Bild aus einer beliebigen Quelle in den lokalen App-Speicher.
// Gibt die neue lokale Datei-URI zurück, damit das Bild später wieder geladen werden kann.
export async function saveImageToLocalAppStorageAsync(sourceUri) {
  await ensureDir();

  // Dateiendung aus der URI ableiten.
  // Query-Parameter werden entfernt, damit am Ende wirklich nur die Endung übrig bleibt.
  const ext = (sourceUri.split(".").pop() || "jpg").split("?")[0].toLowerCase();

  // Eindeutiger Dateiname über Timestamp, damit keine Überschneidungen entstehen.
  const filename = `${Date.now()}.${ext}`;
  const destUri = IMG_DIR + filename;

  // Datei in den App-Ordner kopieren und den Zielpfad zurückgeben.
  await FileSystem.copyAsync({ from: sourceUri, to: destUri }); 
  return destUri;
}
