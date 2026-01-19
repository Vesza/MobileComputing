import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Platform } from "react-native";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;

function clampTo30(n) {
  if (!Number.isFinite(n)) return NaN;
  return Math.max(1, Math.min(30, Math.floor(n)));
}

export default function NotificationCreateDurationScreen({ navigation, route }) {
  const draft = route?.params?.draft ?? { text: "", date: null, time: null, durationSec: null };

  const [value, setValue] = useState(
    draft.durationSec != null ? String(draft.durationSec) : "3"
  );

  const durationNum = useMemo(() => clampTo30(parseInt(value, 10)), [value]);
  const canContinue = Number.isFinite(durationNum) && durationNum >= 1 && durationNum <= 30;

  const goNext = () => {
    if (!canContinue) return;

    navigation.navigate("NotificationCreateSuccess", {
      draft: {
        ...draft,
        durationSec: durationNum,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.heading}>Vibration Dauer</Text>

        <Text style={styles.label}>1–30 Sekunden</Text>

        <TextInput
          value={value}
          onChangeText={(t) => setValue(t.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          placeholder="z.B. 3"
          style={styles.input}
        />

        <Text style={styles.hint}>Maximal 30 Sekunden</Text>

        <View style={{ height: 12 }} />

        <Pressable
          onPress={canContinue ? goNext : null}
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
        >
          <Text style={[styles.nextBtnText, !canContinue && styles.nextBtnTextDisabled]}>
            Weiter
          </Text>
        </Pressable>

        <Text style={styles.summary}>{canContinue ? `${durationNum}s` : "Bitte 1–30 eingeben"}</Text>
      </View>

      <Pressable onPress={() => navigation.goBack()} style={[styles.bottomPressable, styles.left]}>
        <Text style={styles.bottomLinkText}>Zurück</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Welcome")} style={[styles.bottomPressable, styles.right]}>
        <Text style={styles.bottomLinkText}>Welcome</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center" },

  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  label: { fontWeight: "800", textAlign: "center", marginBottom: 8 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
  },

  hint: { color: "grey", textAlign: "center", marginTop: 8 },

  nextBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  nextBtnDisabled: { backgroundColor: "#ccc" },
  nextBtnText: { color: "white", fontWeight: "bold" },
  nextBtnTextDisabled: { color: "#888" },

  summary: { marginTop: 14, color: "grey", textAlign: "center" },

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
