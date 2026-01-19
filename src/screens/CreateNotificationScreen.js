import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { auth, db } from "../services/FirebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function CreateNotificationScreen({ navigation }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  const canSave = text.trim().length > 0;

  const save = async () => {
    try {
      if (!canSave) return;

      const user = auth.currentUser;
      if (!user) {
        setStatus("Nicht eingeloggt.");
        return;
      }

      setStatus("Speichere...");

      await addDoc(collection(db, "users", user.uid, "notifications"), {
        text: text.trim(),
        createdAt: serverTimestamp(),
      });

      setStatus("Notification gespeichert ✅");
      navigation.navigate("Notifications");
    } catch (e) {
      console.log("Save notification error:", e);
      setStatus("Speichern fehlgeschlagen.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Notification</Text>

      <TextInput
        placeholder="Text..."
        value={text}
        onChangeText={setText}
        style={[styles.input, styles.inputMulti]}
        multiline
        textAlignVertical="top"
      />

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
    marginBottom: 12,
    borderRadius: 8,
  },
  inputMulti: { height: 180 },

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
