import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatHHMM } from "../utils/datetime";
import { UI, LAYOUT, COLORS, FONT_SIZE } from "../constants";

import { useAuth } from "../context/AuthContext";
import { saveDraft } from "../services/saveDraft";

export default function CreateTimeScreen({ navigation, route }) {
  const { user, authLoading } = useAuth();

  const [showPicker, setShowPicker] = useState(false);

  const draft = route?.params?.draft ?? { kind: "appointment", title: "", date: null, time: null };
  const [value, setValue] = useState(draft.time ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setValue(draft.time ?? ""), [draft.time]);

  const handleChange = (_event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (!selectedDate) return;

    const newTime = formatHHMM(selectedDate);
    setValue(newTime);
    navigation.setParams({ draft: { ...draft, time: newTime } });
  };

  const canContinue = value && value.length > 0 && !saving && !authLoading;

  const goNext = async () => {
    if (!canContinue) return;

    try {
      setError("");
      setSaving(true);

      const nextDraft = { ...draft, time: value };

      const res = await saveDraft({ draft: nextDraft, uid: user?.uid });

      if (!res?.ok) {
        setError(res?.toast || "Speichern fehlgeschlagen.");
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome", params: { toast: res.toast } }],
      });
    } catch (e) {
      console.log("CreateTime save error:", e);
      setError("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
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
        <Text style={UI.heading}>Uhrzeit auswählen</Text>

        <Pressable style={[UI.bordered, styles.pickBox]} onPress={() => setShowPicker(true)}>
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

        <Pressable
          onPress={canContinue ? goNext : null}
          style={[UI.primaryButton, (!canContinue || saving) && UI.primaryButtonDisabled]}
        >
          <Text style={[UI.primaryButtonText, (!canContinue || saving) && UI.primaryButtonTextDisabled]}>
            {saving ? "Speichere..." : "Termin anlegen"}
          </Text>
        </Pressable>

        {error ? (
          <>
            <View style={{ height: 10 }} />
            <Text style={styles.errorText}>{error}</Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickBox: {
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: COLORS.surface,
  },
  clock: { fontSize: 48, marginBottom: 8 },
  pickText: { color: COLORS.textMuted, fontSize: FONT_SIZE.body },
  errorText: { color: "crimson", textAlign: "center", marginTop: 6 },
});
