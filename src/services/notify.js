import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import { Platform, Vibration } from "react-native";

let soundRef = null;
let vibrateStopTimer = null;
let soundStopTimer = null;

function clampDurationSec(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 3;
  return Math.max(1, Math.min(30, Math.floor(x)));
}

export async function initNotificationsAsync() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) {
    const req = await Notifications.requestPermissionsAsync();
    if (!req.granted) {
      console.log("Notifications permission not granted");
      return false;
    }
  }

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

export async function cancelScheduledAsync(scheduledId) {
  if (!scheduledId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(String(scheduledId));
  } catch (e) {
    console.log("Cancel scheduled error:", e);
  }
}

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

// Vibration: mittel lang, dann 1s Pause, repeat bis Dauer vorbei
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

function stopVibration() {
  if (vibrateStopTimer) clearTimeout(vibrateStopTimer);
  vibrateStopTimer = null;
  Vibration.cancel();
}

async function startRinging(durationSec) {
  await stopRinging();

  const msTotal = clampDurationSec(durationSec) * 1000;

  // assets/sounds/reminder.mp3
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
