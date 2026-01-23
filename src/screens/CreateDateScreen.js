import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDDMMYYYY } from "../utils/datetime";
import { UI, LAYOUT, COLORS, FONT_SIZE } from "../constants";

export default function CreateDateScreen({ navigation, route }) {
  const [showPicker, setShowPicker] = useState(false);

  const draft = route?.params?.draft ?? { kind: "appointment", title: "", date: null, time: null };
  const [value, setValue] = useState(draft.date ?? "");

  useEffect(() => {
    setValue(draft.date ?? "");
  }, [draft.date]);

  const handleChange = (_event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (!selectedDate) return;

    const newDate = formatDDMMYYYY(selectedDate);
    setValue(newDate);
    navigation.setParams({ draft: { ...draft, date: newDate } });
  };

  const canContinue = value && value.length > 0;

  const goNext = () => {
    if (!canContinue) return;
    navigation.navigate("CreateTime", { draft: { ...draft, date: value } });
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
        <Text style={UI.heading}>Datum auswählen</Text>

        <Pressable style={[UI.bordered, styles.pickBox]} onPress={() => setShowPicker(true)}>
          <Text style={styles.pickText}>{value || "Hier tippen, um Datum zu wählen"}</Text>
        </Pressable>

       {showPicker && (
         <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          accentColor={COLORS.surface} // 👈 put it HERE
          />
        )}


        {Platform.OS === "ios" && showPicker ? <View style={{ height: 10 }} /> : null}
        {Platform.OS === "ios" && showPicker ? (
          <Button title="Fertig" onPress={() => setShowPicker(false)} />
        ) : null}

        <View style={{ height: 12 }} />

        <Pressable
          onPress={canContinue ? goNext : null}
          style={[UI.primaryButton, !canContinue && UI.primaryButtonDisabled]}
        >
          <Text style={[UI.primaryButtonText, !canContinue && UI.primaryButtonTextDisabled]}>
            Uhrzeit angeben
          </Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  pickBox: {
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: COLORS.surface,
  },
  pickText: { color: COLORS.textMuted, fontSize: FONT_SIZE.body },
});
