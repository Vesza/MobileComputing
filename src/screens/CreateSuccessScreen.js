import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { auth, db } from "../services/FirebaseConfig";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import {
  scheduleLocalReminderAsync,
  scheduleLocalNotificationAsync,
  cancelScheduledAsync,
} from "../services/notify";
import { clampDurationSec, toDateFromStrings } from "../utils/datetime";

export default function CreateSuccessScreen({ navigation, route }) {
  const [status, setStatus] = useState("Speichere...");

  const draft = route?.params?.draft ?? { kind: "appointment" };
  const kind = draft.kind ?? "appointment";

  const title = (draft.title ?? "").trim();
  const date = draft.date ?? "";
  const time = draft.time ?? "";
  const durationSec = clampDurationSec(draft.durationSec, kind === "reminder" ? 10 : 3);

  const description = typeof draft.description === "string" ? draft.description.trim() : null;
  const imageUri = typeof draft.imageUri === "string" ? draft.imageUri : null;

  // NEW:
  const audioUri = typeof draft.audioUri === "string" ? draft.audioUri : null;

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
          setStatus("Ungültige Daten. Bitte erneut erstellen.");
          return;
        }

        const when = toDateFromStrings(date, time);
        const now = new Date();

        if (
          (kind === "reminder" || kind === "notification") &&
          when.getTime() <= now.getTime() + 10_000
        ) {
          setStatus("Zeitpunkt liegt zu nah in der Vergangenheit. Bitte Uhrzeit in der Zukunft wählen.");
          return;
        }

        if (kind === "appointment") {
          await addDoc(collection(db, "users", user.uid, "appointments"), {
            title,
            startsAt: Timestamp.fromDate(when),
            createdAt: serverTimestamp(),
            description,
            imageUri,
            audioUri, // <-- NEW
          });
          setStatus("Termin erfolgreich eingetragen ✅");
          return;
        }

        if (kind === "reminder") {
          scheduledId = await scheduleLocalReminderAsync({
            title,
            startsAtDate: when,
            durationSec,
          });

          await addDoc(collection(db, "users", user.uid, "reminders"), {
            title,
            startsAt: Timestamp.fromDate(when),
            durationSec,
            scheduledId: String(scheduledId),
            createdAt: serverTimestamp(),
          });

          setStatus("Reminder erfolgreich eingetragen ✅");
          return;
        }

        // notification
        scheduledId = await scheduleLocalNotificationAsync({
          text: title,
          fireAtDate: when,
          durationSec,
        });

        await addDoc(collection(db, "users", user.uid, "notifications"), {
          text: title,
          fireAt: Timestamp.fromDate(when),
          durationSec,
          scheduledId: String(scheduledId),
          createdAt: serverTimestamp(),
        });

        setStatus("Notification gespeichert ✅");
      } catch (e) {
        console.log("CreateSuccess error:", e);
        if (scheduledId) await cancelScheduledAsync(scheduledId);
        setStatus("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      }
    };

    run();
  }, [kind, title, date, time, durationSec, description, imageUri, audioUri]);

  const goHome = () => {
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
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
