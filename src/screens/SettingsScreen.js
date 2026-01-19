import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Einstellungen</Text>

      <View style={styles.card}>
        <Text style={styles.text}>
          Hintergrundbild ändern kommt als nächster Schritt.
          (Dafür bauen wir eine App-weite Background-Logik + ImagePicker.)
        </Text>
      </View>

      <Pressable onPress={() => navigation.goBack()} style={{ paddingVertical: 14 }}>
        <Text style={styles.link}>Zurück</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "white",
  },
  text: { color: "grey" },
  link: { color: "grey", textDecorationLine: "underline", textAlign: "center" },
});
