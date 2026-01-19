import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { auth, db } from "../services/FirebaseConfig";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";

export default function CreateReminderScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [durationSec, setDurationSec] = useState("10");
  const [when, setWhen] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [status, setStatus] = useState("");

  const canSave = title.trim().length > 0 && Number(durationSec) > 0;

  const save = async () => {
    try {
      if (!canSave) return;

      const user = auth.currentUser;
      if (!user) {
        setStatus("Nicht eingeloggt.");
        return;
      }

      setStatus("Speichere...");

      await addDoc(collection(db, "users", user.uid, "reminders"), {
        title: title.trim(),
        startsAt: Timestamp.fromDate(when),
        durationSec: Number(durationSec),
        createdAt: serverTimestamp(),
      });

      setStatus("Reminder gespeichert ✅");
      navigation.navigate("Reminders");
    } catch (e) {
      console.log("Save reminder error:", e);
      setStatus("Speichern fehlgeschlagen.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminder erstellen</Text>

      <TextInput
        placeholder="Reminder Text"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <Text style={styles.label}>Zeitpunkt</Text>

      <Pressable style={styles.pickBtn} onPress={() => setShowDate(true)}>
        <Text style={styles.pickText}>Datum wählen</Text>
      </Pressable>

      <Pressable style={styles.pickBtn} onPress={() => setShowTime(true)}>
        <Text style={styles.pickText}>Uhrzeit wählen</Text>
      </Pressable>

      <Text style={styles.preview}>
        {when.toLocaleString("de-DE", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>

      <Text style={styles.label}>Dauer (Sekunden)</Text>
      <TextInput
        placeholder="z.B. 10"
        value={durationSec}
        onChangeText={setDurationSec}
        keyboardType="number-pad"
        style={styles.input}
      />

      {showDate && (
        <DateTimePicker
          value={when}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(e, d) => {
            setShowDate(false);
            if (!d) return;
            // keep time, change date:
            const n = new Date(when);
            n.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
            setWhen(n);
          }}
        />
      )}

      {showTime && (
        <DateTimePicker
          value={when}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          is24Hour
          onChange={(e, d) => {
            setShowTime(false);
            if (!d) return;
            const n = new Date(when);
            n.setHours(d.getHours(), d.getMinutes(), 0, 0);
            setWhen(n);
          }}
        />
      )}

      <View style={{ height: 12 }} />

      <Pressable
        onPress={save}
        style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
      >
        <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
          Speichern
        </Text>
      </Pressable>

      {status ? <Text style={styles.status}>{status}</Text> : null}

      <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 14 }}>
        <Text style={styles.link}>Zurück</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },

  label: { fontWeight: "800", marginTop: 6, marginBottom: 6 },
  pickBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f2f2f2",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  pickText: { fontWeight: "800" },

  preview: { color: "grey", marginBottom: 10, textAlign: "center" },

  saveBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnDisabled: { backgroundColor: "#ccc" },
  saveText: { color: "white", fontWeight: "bold" },
  saveTextDisabled: { color: "#888" },

  status: { marginTop: 10, color: "grey", textAlign: "center" },
  link: { color: "grey", textDecorationLine: "underline", textAlign: "center" },
});
