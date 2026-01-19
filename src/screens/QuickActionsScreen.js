import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function QuickActionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Aktionen</Text>

        <Pressable
          style={styles.btn}
          onPress={() => navigation.navigate("CreateTitle")}
        >
          <Text style={styles.btnText}>Termin hinzufügen</Text>
        </Pressable>

        <View style={{ height: 12 }} />

        <Pressable
          style={styles.btn}
          onPress={() => navigation.navigate("ReminderCreateTitle")}
        >
          <Text style={styles.btnText}>Reminder</Text>
        </Pressable>

        <View style={{ height: 12 }} />

        <Pressable
          style={styles.btn}
          onPress={() => navigation.navigate("NotificationCreateText")}
        >
          <Text style={styles.btnText}>Quick Notification</Text>
        </Pressable>

        <View style={{ height: 18 }} />

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Schließen</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 16 },
  btn: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f2f2f2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { fontWeight: "800" },
  link: { color: "grey", textDecorationLine: "underline", textAlign: "center" },
});
