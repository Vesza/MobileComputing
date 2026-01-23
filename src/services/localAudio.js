// Expo FileSystem wird genutzt, um Dateien lokal in der App-Directory zu speichern.
import * as FileSystem from "expo-file-system/legacy";

// Zielordner für Audio-Dateien innerhalb des App-Speichers.
const AUDIO_DIR = FileSystem.documentDirectory + "audio/";

// Stellt sicher, dass der Zielordner existiert.
// Falls nicht vorhanden, wird er inkl. Zwischenordnern angelegt.
async function ensureDir() {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
  }
}

// Kopiert eine Audio-Datei aus einer beliebigen Quelle in den lokalen App-Speicher.
// Gibt die neue lokale Datei-URI zurück, damit sie später wieder geladen werden kann.
export async function saveAudioToLocalAppStorageAsync(sourceUri) {
  await ensureDir();

  // Dateiendung aus der URI ableiten.
  // Query-Parameter werden entfernt und die Endung wird auf eine sinnvolle Länge begrenzt.
  const rawExt = (sourceUri.split(".").pop() || "m4a").split("?")[0].toLowerCase();
  const ext = rawExt.length <= 5 ? rawExt : "m4a";

  // Eindeutiger Dateiname über Timestamp, damit keine Kollisionen entstehen.
  const filename = `${Date.now()}.${ext}`;
  const destUri = AUDIO_DIR + filename;

  // Datei in den App-Ordner kopieren und den Zielpfad zurückgeben.
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}
