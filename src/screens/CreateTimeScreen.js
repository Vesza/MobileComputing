import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BottomLinks from "../components/BottomLinks";
import { formatHHMM } from "../utils/datetime";

export default function CreateTimeScreen({ navigation, route }) {
  const [showPicker, setShowPicker] = useState(false);

  const draft = route?.params?.draft ?? { kind: "appointment", title: "", date: null, time: null };
  const [value, setValue] = useState(draft.time ?? "");

  useEffect(() => setValue(draft.time ?? ""), [draft.time]);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (!selectedDate) return;

    const newTime = formatHHMM(selectedDate);
    setValue(newTime);
    navigation.setParams({ draft: { ...draft, time: newTime } });
  };

  const canContinue = value && value.length > 0;

  const goNext = () => {
    if (!canContinue) return;

    const nextDraft = { ...draft, time: value };
    const needsDuration = draft.kind === "reminder" || draft.kind === "notification";

    navigation.navigate(needsDuration ? "CreateDuration" : "CreateSuccess", { draft: nextDraft });
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.heading}>Uhrzeit auswählen</Text>

        <Pressable style={styles.pickBox} onPress={() => setShowPicker(true)}>
          <Text style={styles.clock}>🕒</Text>
          <Text style={styles.pickText}>{value || "Hier tippen, um Uhrzeit zu wählen"}</Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleChange}
            is24Hour
          />
        )}

        {Platform.OS === "ios" && showPicker ? (
          <>
            <View style={{ height: 10 }} />
            <Button title="Fertig" onPress={() => setShowPicker(false)} />
          </>
        ) : null}

        <View style={{ height: 12 }} />

        <Pressable onPress={canContinue ? goNext : null} style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}>
          <Text style={[styles.nextBtnText, !canContinue && styles.nextBtnTextDisabled]}>Weiter</Text>
        </Pressable>
      </View>

      <BottomLinks
        onLeftPress={() => navigation.goBack()}
        onRightPress={() => navigation.navigate("Welcome")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center" },
  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  pickBox: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 16, alignItems: "center", marginBottom: 12 },
  clock: { fontSize: 48, marginBottom: 8 },
  pickText: { color: "grey", fontSize: 16 },
  nextBtn: { backgroundColor: "#007AFF", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  nextBtnDisabled: { backgroundColor: "#ccc" },
  nextBtnText: { color: "white", fontWeight: "bold" },
  nextBtnTextDisabled: { color: "#888" },
});
