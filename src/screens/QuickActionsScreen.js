// React-Komponente für den Screen.
// React Native Bausteine für Layout, Text, Styles und klickbare Bereiche.
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

// Zentrale Style-Konstanten für Farben und Schriftstärken.
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function QuickActionsScreen({ navigation }) {
  // Screen zeigt zwei Schnellaktionen und navigiert in den Create-Flow mit passendem "kind".
  return (
    <View style={styles.container}>
      <View style={styles.center}>

        {/* Startet den Create-Flow für einen Termin */}
        <Pressable style={styles.btn} onPress={() => navigation.navigate("CreateTitle", { kind: "appointment" })}>
          <Text style={styles.btnText}>Termin hinzufügen</Text>
        </Pressable>

        {/* Einfacher Abstand zwischen den Buttons */}
        <View style={{ height: 12 }} />

        {/* Startet den Create-Flow für eine schnelle Notification */}
        <Pressable style={styles.btn} onPress={() => navigation.navigate("CreateTitle", { kind: "notification" })}>
          <Text style={styles.btnText}>Quick Notification</Text>
        </Pressable>

        {/* Zusätzlicher Abstand nach unten, damit der Block ruhig wirkt */}
        <View style={{ height: 18 }} />

      </View>
    </View>
  );
}

// Styles für Screen-Hintergrund, Zentrierung und Button-Design.
// Farben und Schriftstärken kommen aus den zentralen Konstanten.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },

  center: {
    flex: 1,
    justifyContent: "center",
  },

  btn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
  },
});
