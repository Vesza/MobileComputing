import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import BottomLinks from "../components/BottomLinks";
import { clampDurationSec } from "../utils/datetime";

export default function CreateDurationScreen({ navigation, route }) {
  const draft = route?.params?.draft ?? { kind: "reminder", durationSec: null };

  const defaultValue = draft.kind === "reminder" ? "10" : "3";
  const [value, setValue] = useState(draft.durationSec != null ? String(draft.durationSec) : defaultValue);

  const durationNum = useMemo(() => clampDurationSec(parseInt(value, 10), draft.kind === "reminder" ? 10 : 3), [
    value,
    draft.kind,
  ]);

  const canContinue = Number.isFinite(durationNum) && durationNum >= 1 && durationNum <= 30;

  const goNext = () => {
    if (!canContinue) return;
    navigation.navigate("CreateSuccess", { draft: { ...draft, durationSec: durationNum } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.heading}>Dauer</Text>
        <Text style={styles.label}>1–30 Sekunden</Text>

        <TextInput
          value={value}
          onChangeText={(t) => setValue(t.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          placeholder={defaultValue}
          style={styles.input}
        />

        <Text style={styles.hint}>Maximal 30 Sekunden</Text>

        <View style={{ height: 12 }} />

        <Pressable onPress={canContinue ? goNext : null} style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}>
          <Text style={[styles.nextBtnText, !canContinue && styles.nextBtnTextDisabled]}>Weiter</Text>
        </Pressable>

        <Text style={styles.summary}>{canContinue ? `${durationNum}s` : "Bitte 1–30 eingeben"}</Text>
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
  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  label: { fontWeight: "800", textAlign: "center", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, textAlign: "center", fontSize: 18 },
  hint: { color: "grey", textAlign: "center", marginTop: 8 },
  nextBtn: { backgroundColor: "#007AFF", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  nextBtnDisabled: { backgroundColor: "#ccc" },
  nextBtnText: { color: "white", fontWeight: "bold" },
  nextBtnTextDisabled: { color: "#888" },
  summary: { marginTop: 14, color: "grey", textAlign: "center" },
});
