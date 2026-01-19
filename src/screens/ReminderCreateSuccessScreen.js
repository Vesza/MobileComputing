import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { auth, db } from "../services/FirebaseConfig";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { scheduleLocalReminderAsync, cancelScheduledAsync } from "../services/notify";

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

export default function ReminderCreateSuccessScreen({ navigation, route }) {
  const [status, setStatus] = useState("Speichere Reminder...");

  const draft = route?.params?.draft ?? { title: "", date: null, time: null, durationSec: 10 };

  const title = (draft.title ?? "").trim();
  const date = draft.date ?? "";
  const time = draft.time ?? "";
  const durationSec = clamp30(draft.durationSec, 10);

  useEffect(() => {
    const run = async () => {
      let scheduledId = null;

      try {
        const user = auth.currentUser;
        if (!user) {
          setStatus("Nicht eingeloggt. Bitte erneut einloggen.");
          return;
        }

        if (!title || !date || !time) {
          setStatus("Ungültige Reminder-Daten. Bitte erneut erstellen.");
          return;
        }

        const startsAt = toDateFromStrings(date, time);
        const now = new Date();

        if (startsAt.getTime() <= now.getTime() + 10_000) {
          setStatus("Zeitpunkt liegt zu nah in der Vergangenheit. Bitte Uhrzeit in der Zukunft wählen.");
          return;
        }

        // Schedule first
        scheduledId = await scheduleLocalReminderAsync({
          title,
          startsAtDate: startsAt,
          durationSec,
        });

        // Save with scheduledId
        await addDoc(collection(db, "users", user.uid, "reminders"), {
          title,
          startsAt: Timestamp.fromDate(startsAt),
          durationSec,
          scheduledId: String(scheduledId),
          createdAt: serverTimestamp(),
        });

        setStatus("Reminder erfolgreich eingetragen ✅");
      } catch (e) {
        console.log("Save reminder error:", e);
        if (scheduledId) await cancelScheduledAsync(scheduledId);
        setStatus("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      }
    };

    run();
  }, [title, date, time, durationSec]);

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
