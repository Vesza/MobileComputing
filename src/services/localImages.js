import * as FileSystem from "expo-file-system/legacy"; 

const IMG_DIR = FileSystem.documentDirectory + "images/";

async function ensureDir() {
  const dirInfo = await FileSystem.getInfoAsync(IMG_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true });
  }
}

export async function saveImageToLocalAppStorageAsync(sourceUri) {
  await ensureDir();

  const ext = (sourceUri.split(".").pop() || "jpg").split("?")[0].toLowerCase();
  const filename = `${Date.now()}.${ext}`;
  const destUri = IMG_DIR + filename;

  await FileSystem.copyAsync({ from: sourceUri, to: destUri }); 
  return destUri;
}
