import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { clampDurationSec } from "../utils/datetime";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function CreateDurationScreen({ navigation, route }) {
  const draft = route?.params?.draft ?? { kind: "reminder", durationSec: null };

  const defaultValue = draft.kind === "reminder" ? "10" : "3";
  const [value, setValue] = useState(
    draft.durationSec != null ? String(draft.durationSec) : defaultValue
  );

  const durationNum = useMemo(
    () => clampDurationSec(parseInt(value, 10), draft.kind === "reminder" ? 10 : 3),
    [value, draft.kind]
  );

  const canContinue = Number.isFinite(durationNum) && durationNum >= 1 && durationNum <= 30;

  const goNext = () => {
    if (!canContinue) return;
    navigation.navigate("CreateSuccess", { draft: { ...draft, durationSec: durationNum } });
  };

  return (
    <View
      style={[
        UI.screen,
        {
          paddingTop: LAYOUT.offsets.top,
          paddingBottom: LAYOUT.offsets.bottom,
        },
      ]}
    >
      <View style={UI.center}>
        <Text style={UI.heading}>Dauer</Text>
        <Text style={styles.label}>1–30 Sekunden</Text>

        <TextInput
          value={value}
          onChangeText={(t) => setValue(t.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          placeholder={defaultValue}
          placeholderTextColor={COLORS.textMuted}
          style={[UI.bordered, styles.input]}
        />

        <Text style={styles.hint}>Maximal 30 Sekunden</Text>

        <View style={{ height: 12 }} />

        <Pressable
          onPress={canContinue ? goNext : null}
          style={[UI.primaryButton, !canContinue && UI.primaryButtonDisabled]}
        >
          <Text style={[UI.primaryButtonText, !canContinue && UI.primaryButtonTextDisabled]}>
            Weiter
          </Text>
        </Pressable>

        <Text style={styles.summary}>
          {canContinue ? `${durationNum}s` : "Bitte 1–30 eingeben"}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: "center",
    marginBottom: 8,
    color: COLORS.text,
  },

  input: {
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    fontSize: FONT_SIZE.heading,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },

  hint: { color: COLORS.textMuted, textAlign: "center", marginTop: 8 },

  summary: { marginTop: 14, color: COLORS.textMuted, textAlign: "center" },
});
