// Expo Notifications ist für lokale Push-Notifications zuständig.
// Expo AV wird genutzt, um bei Remindern einen Ton abzuspielen.
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import { Platform, Vibration } from "react-native";

// Globale Referenzen, damit wir Sound und Timer stoppen können,
// auch wenn eine neue Notification reinkommt.
let soundRef = null;
let vibrateStopTimer = null;
let soundStopTimer = null;

// Sicherheits-Helper: Dauer immer als ganze Zahl zwischen 1 und 30 Sekunden.
// Fallback ist 3 Sekunden, falls der Wert ungültig ist.
function clampDurationSec(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 3;
  return Math.max(1, Math.min(30, Math.floor(x)));
}

// Initialisiert Notification-Verhalten, Berechtigungen und Android-Channels.
// Gibt true zurück, wenn Permissions vorhanden sind, sonst false.
export async function initNotificationsAsync() {
  // Legt fest, wie Notifications angezeigt werden sollen, wenn die App läuft.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Prüft bestehende Rechte und fragt sie bei Bedarf an.
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) {
    const req = await Notifications.requestPermissionsAsync();
    if (!req.granted) {
      console.log("Notifications permission not granted");
      return false;
    }
  }

  // Android braucht Channels, um Sound/Vibration und Wichtigkeit sauber zu steuern.
  // Für iOS ist das nicht nötig, deshalb nur auf Android.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#007AFF",
    });

    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      lightColor: "#007AFF",
    });
  }

  return true;
}

// Plant einen Reminder als lokale Notification zu einem bestimmten Zeitpunkt.
// In data wird der Typ und die gewünschte Dauer mitgegeben.
export async function scheduleLocalReminderAsync({ title, startsAtDate, durationSec }) {
  const triggerDate = startsAtDate instanceof Date ? startsAtDate : new Date(startsAtDate);
  const dur = clampDurationSec(durationSec);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "⏰ Reminder",
      body: title || "(ohne Text)",
      sound: "default",
      data: { type: "reminder", durationSec: dur },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      ...(Platform.OS === "android" ? { channelId: "reminders" } : null),
    },
  });
}

// Plant eine “normale” Notification, bei der später nur Vibration ausgelöst wird.
// Auch hier wird die Dauer als data mitgegeben.
export async function scheduleLocalNotificationAsync({ text, fireAtDate, durationSec }) {
  const triggerDate = fireAtDate instanceof Date ? fireAtDate : new Date(fireAtDate);
  const dur = clampDurationSec(durationSec);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "❗ Notification",
      body: text || "(ohne Text)",
      sound: "default",
      data: { type: "notification", durationSec: dur },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      ...(Platform.OS === "android" ? { channelId: "default" } : null),
    },
  });
}

// Löscht eine bereits geplante lokale Notification anhand der scheduledId.
// Fehler werden bewusst nur geloggt, weil ein fehlendes Cancel kein Hard-Fail sein muss.
export async function cancelScheduledAsync(scheduledId) {
  if (!scheduledId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(String(scheduledId));
  } catch (e) {
    console.log("Cancel scheduled error:", e);
  }
}

// Registriert Listener für eingehende Notifications und Klicks darauf.
// Je nach Typ wird Vibration oder Klingeln gestartet.
// Gibt eine Cleanup-Funktion zurück, die beide Listener entfernt.
export function attachNotificationListeners() {
  const subReceive = Notifications.addNotificationReceivedListener(async (notif) => {
    try {
      const data = notif?.request?.content?.data ?? {};
      const dur = clampDurationSec(data.durationSec ?? 3);
      const type = data.type;

      if (type === "notification") {
        startVibration(dur);
      } else if (type === "reminder") {
        await startRinging(dur);
      }
    } catch (e) {
      console.log("Notification receive handler error:", e);
    }
  });

  const subResponse = Notifications.addNotificationResponseReceivedListener(async (resp) => {
    try {
      const data = resp?.notification?.request?.content?.data ?? {};
      const dur = clampDurationSec(data.durationSec ?? 3);
      const type = data.type;

      if (type === "notification") {
        startVibration(dur);
      } else if (type === "reminder") {
        await startRinging(dur);
      }
    } catch (e) {
      console.log("Notification response handler error:", e);
    }
  });

  return () => {
    subReceive.remove();
    subResponse.remove();
  };
}

// Startet eine wiederholte Vibration und stoppt sie nach durationSec.
// Das Vibrationsmuster läuft in einer Schleife, bis wir per Timer abbrechen.
function startVibration(durationSec) {
  stopVibration();

  const msTotal = clampDurationSec(durationSec) * 1000;
  const VIB_MS = 700;
  const PAUSE_MS = 1000;

  Vibration.vibrate([0, VIB_MS, PAUSE_MS], true);

  vibrateStopTimer = setTimeout(() => {
    stopVibration();
  }, msTotal);
}

// Stoppt laufende Vibration und räumt Timer auf.
function stopVibration() {
  if (vibrateStopTimer) clearTimeout(vibrateStopTimer);
  vibrateStopTimer = null;
  Vibration.cancel();
}

// Startet ein Klingeln über eine Audio-Datei und stoppt es nach durationSec.
// Vorher wird ein eventuell laufender Sound sauber beendet.
async function startRinging(durationSec) {
  await stopRinging();

  const msTotal = clampDurationSec(durationSec) * 1000;

  // Lokales Asset, das als Reminder-Ton abgespielt wird.
  const src = require("../../assets/sounds/reminder.mp3");

  const { sound } = await Audio.Sound.createAsync(src, {
    shouldPlay: true,
    isLooping: true,
    volume: 1.0,
  });

  soundRef = sound;
  await soundRef.playAsync();

  soundStopTimer = setTimeout(() => {
    stopRinging();
  }, msTotal);
}

// Stoppt den Reminder-Sound und gibt Ressourcen frei.
// Läuft das Stop/Unload schief, wird der Fehler bewusst ignoriert, damit die App stabil bleibt.
async function stopRinging() {
  if (soundStopTimer) clearTimeout(soundStopTimer);
  soundStopTimer = null;

  if (soundRef) {
    try {
      await soundRef.stopAsync();
    } catch {}
    try {
      await soundRef.unloadAsync();
    } catch {}
    soundRef = null;
  }
}
