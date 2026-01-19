import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { auth, db } from "../services/FirebaseConfig";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";

function toDateFromStrings(ddmmyyyy, hhmm) {
  const [dd, mm, yyyy] = ddmmyyyy.split(".").map((x) => parseInt(x, 10));
  const [hh, min] = hhmm.split(":").map((x) => parseInt(x, 10));
  return new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
}

export default function CreateSuccessScreen({ navigation, route }) {
  const [status, setStatus] = useState("Speichere Termin...");

  const draft = route?.params?.draft ?? { title: "", date: null, time: null };
  const title = (draft.title ?? "").trim();
  const date = draft.date ?? "";
  const time = draft.time ?? "";
  const description =
  typeof draft.description === "string" ? draft.description.trim() : null;
  const imageUri =
  typeof draft.imageUri === "string" ? draft.imageUri : null;

  useEffect(() => {
    const run = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setStatus("Nicht eingeloggt. Bitte erneut einloggen.");
          return;
        }

        if (!title || !date || !time) {
          setStatus("Ungültige Termindaten. Bitte erneut erstellen.");
          return;
        }

        const startsAt = toDateFromStrings(date, time);

        await addDoc(collection(db, "users", user.uid, "appointments"), {
          title,
          startsAt: Timestamp.fromDate(startsAt),
          createdAt: serverTimestamp(),
          description,
          imageUri,
        });

        setStatus("Termin erfolgreich eingetragen ✅");
      } catch (e) {
        console.log("Save appointment error:", e);
        setStatus("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      }
    };

    run();
    // important: this should only run when the passed draft changes
  }, [title, date, time]);

  const goHome = () => {
    // Reset so user can't go "back" and create duplicates
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
