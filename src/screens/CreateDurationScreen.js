// React wird für die Komponente benötigt.
// useState hält das Eingabefeld, useMemo berechnet aus der Eingabe eine saubere Zahl.
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";

// clampDurationSec begrenzt die Dauer auf einen gültigen Bereich.
// UI/LAYOUT/COLORS/FONT_SIZE/FONT_WEIGHT liefern Standard-Styles und Design-Konstanten.
import { clampDurationSec } from "../utils/datetime";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function CreateDurationScreen({ navigation, route }) {
  // draft kommt aus vorherigen Schritten.
  // Wenn nichts übergeben wurde, wird ein Standard-Draft für reminder genutzt.
  const draft = route?.params?.draft ?? { kind: "reminder", durationSec: null };

  // defaultValue setzt einen sinnvollen Standardwert je nach Typ.
  // reminder startet bei 10 Sekunden, andere Typen bei 3 Sekunden.
  const defaultValue = draft.kind === "reminder" ? "10" : "3";
  const [value, setValue] = useState(
    draft.durationSec != null ? String(draft.durationSec) : defaultValue
  );

  // durationNum ist die bereinigte Zahl aus dem Eingabefeld.
  // parseInt macht aus dem String eine Zahl, clampDurationSec begrenzt auf 1–30 Sekunden.
  // Der zweite Parameter setzt einen Fallback, falls die Eingabe nicht parsebar ist.
  const durationNum = useMemo(
    () => clampDurationSec(parseInt(value, 10), draft.kind === "reminder" ? 10 : 3),
    [value, draft.kind]
  );

  // canContinue bestimmt, ob der Weiter-Button aktiv sein darf.
  // Zusätzlich wird geprüft, ob der Wert im erlaubten Bereich liegt.
  const canContinue = Number.isFinite(durationNum) && durationNum >= 1 && durationNum <= 30;

  // Navigation zum nächsten Schritt, dabei wird durationSec in den Draft geschrieben.
  const goNext = () => {
    if (!canContinue) return;
    navigation.navigate("CreateSuccess", { draft: { ...draft, durationSec: durationNum } });
  };

  // Layout nutzt UI.screen als Basis und setzt top/bottom Padding aus LAYOUT.
  // TextInput akzeptiert nur Zahlen, da alle anderen Zeichen entfernt werden.
  // Button-Styling und Disabled-Zustand werden über UI-Styles gesteuert.
  // summary zeigt entweder den finalen Wert oder eine kurze Eingabeaufforderung.
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

// Styles für Beschriftung, Eingabefeld und Hinweistexte.
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
