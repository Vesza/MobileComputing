import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { auth, db } from "../services/firebase";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";

function toDateFromStrings(ddmmyyyy, hhmm) {
  const [dd, mm, yyyy] = ddmmyyyy.split(".").map((x) => parseInt(x, 10));
  const [hh, min] = hhmm.split(":").map((x) => parseInt(x, 10));
  return new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
}

export default function CreateSuccessScreen({ title, date, time, goHome }) {
  const [status, setStatus] = useState("Speichere Termin...");

  useEffect(() => {
    const run = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setStatus("Nicht eingeloggt. Bitte erneut einloggen.");
          return;
        }

        const startsAt = toDateFromStrings(date, time);

        await addDoc(collection(db, "users", user.uid, "appointments"), {
          title: title.trim(),
          startsAt: Timestamp.fromDate(startsAt),
          createdAt: serverTimestamp(),
        });

        setStatus("Termin erfolgreich eingetragen ✅");
      } catch (e) {
        console.log("Save appointment error:", e);
        setStatus("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      }
    };

    run();
  }, [title, date, time]);

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
