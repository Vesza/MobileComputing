import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function QuickActionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.center}>

        <Pressable style={styles.btn} onPress={() => navigation.navigate("CreateTitle", { kind: "appointment" })}>
          <Text style={styles.btnText}>Termin hinzufügen</Text>
        </Pressable>

        <View style={{ height: 12 }} />

        <Pressable style={styles.btn} onPress={() => navigation.navigate("CreateTitle", { kind: "notification" })}>
          <Text style={styles.btnText}>Quick Notification</Text>
        </Pressable>

        <View style={{ height: 18 }} />

      </View>
    </View>
  );
}

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

