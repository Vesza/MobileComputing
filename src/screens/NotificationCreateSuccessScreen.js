import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { auth, db } from "../services/FirebaseConfig";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { scheduleLocalNotificationAsync, cancelScheduledAsync } from "../services/notify";

function toDateFromStrings(ddmmyyyy, hhmm) {
  const [dd, mm, yyyy] = ddmmyyyy.split(".").map((x) => parseInt(x, 10));
  const [hh, min] = hhmm.split(":").map((x) => parseInt(x, 10));
  return new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
}

function clamp30(n, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(1, Math.min(30, Math.floor(x)));
}

export default function NotificationCreateSuccessScreen({ navigation, route }) {
  const [status, setStatus] = useState("Speichere Notification...");

  const draft = route?.params?.draft ?? { text: "", date: null, time: null, durationSec: 3 };

  const text = (draft.text ?? "").trim();
  const date = draft.date ?? "";
  const time = draft.time ?? "";
  const durationSec = clamp30(draft.durationSec, 3);

  useEffect(() => {
    const run = async () => {
      let scheduledId = null;

      try {
        const user = auth.currentUser;
        if (!user) {
          setStatus("Nicht eingeloggt. Bitte erneut einloggen.");
          return;
        }

        if (!text || !date || !time) {
          setStatus("Ungültige Notification-Daten. Bitte erneut erstellen.");
          return;
        }

        const fireAt = toDateFromStrings(date, time);
        const now = new Date();

        // Block: past / too close
        if (fireAt.getTime() <= now.getTime() + 10_000) {
          setStatus("Zeitpunkt liegt zu nah in der Vergangenheit. Bitte Uhrzeit in der Zukunft wählen.");
          return;
        }

        // 1) Schedule first (so we can cancel if Firestore fails)
        scheduledId = await scheduleLocalNotificationAsync({
          text,
          fireAtDate: fireAt,
          durationSec,
        });

        // 2) Save in Firestore with scheduledId
        await addDoc(collection(db, "users", user.uid, "notifications"), {
          text,
          fireAt: Timestamp.fromDate(fireAt),
          durationSec,
          scheduledId: String(scheduledId),
          createdAt: serverTimestamp(),
        });

        setStatus("Notification gespeichert ✅");
      } catch (e) {
        console.log("Save notification error:", e);
        if (scheduledId) await cancelScheduledAsync(scheduledId);
        setStatus("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      }
    };

    run();
  }, [text, date, time, durationSec]);

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
      <View style={{ height: 14 }} />
      <Button title="Weiter" onPress={goHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  text: { textAlign: "center", fontSize: 16, color: "grey" },
});
