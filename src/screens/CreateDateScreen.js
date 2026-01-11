import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;

function formatDDMMYYYY(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export default function CreateDateScreen({ value, setValue, goBack, goHome, goNext }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (!selectedDate) return;
    setValue(formatDDMMYYYY(selectedDate));
  };

  const canContinue = value && value.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.heading}>Datum auswählen</Text>

        <Pressable style={styles.pickBox} onPress={() => setShowPicker(true)}>
          <Text style={styles.pickText}>{value || "Hier tippen, um Datum zu wählen"}</Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={handleChange}
          />
        )}

        {Platform.OS === "ios" && showPicker ? <View style={{ height: 10 }} /> : null}
        {Platform.OS === "ios" && showPicker ? (
          <Button title="Fertig" onPress={() => setShowPicker(false)} />
        ) : null}

        <View style={{ height: 12 }} />

        <Pressable
          onPress={canContinue ? goNext : null}
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
        >
          <Text style={[styles.nextBtnText, !canContinue && styles.nextBtnTextDisabled]}>
            Weiter
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={goBack}
        style={[styles.bottomPressable, styles.left]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.bottomLinkText}>Zurück</Text>
      </Pressable>

      <Pressable
        onPress={goHome}
        style={[styles.bottomPressable, styles.right]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.bottomLinkText}>Welcome</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center" },

  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },

  pickBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  pickText: { color: "grey", fontSize: 16 },

  nextBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  nextBtnDisabled: { backgroundColor: "#ccc" },
  nextBtnText: { color: "white", fontWeight: "bold" },
  nextBtnTextDisabled: { color: "#888" },

  bottomPressable: {
    position: "absolute",
    bottom: BOTTOM_OFFSET,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 140,
    minHeight: 56,
    justifyContent: "center",
  },
  bottomLinkText: { color: "grey", textDecorationLine: "underline" },
  left: { left: 10 },
  right: { right: 10, alignItems: "flex-end" },
});
