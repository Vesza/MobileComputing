import * as FileSystem from "expo-file-system/legacy";

const AUDIO_DIR = FileSystem.documentDirectory + "audio/";

async function ensureDir() {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
  }
}

export async function saveAudioToLocalAppStorageAsync(sourceUri) {
  await ensureDir();

  const rawExt = (sourceUri.split(".").pop() || "m4a").split("?")[0].toLowerCase();
  const ext = rawExt.length <= 5 ? rawExt : "m4a";

  const filename = `${Date.now()}.${ext}`;
  const destUri = AUDIO_DIR + filename;

  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}
