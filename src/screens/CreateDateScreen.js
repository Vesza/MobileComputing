// React und Hooks für State und Nebenwirkungen.
// View/Text/Button/Pressable sind UI-Bausteine, Platform wird für plattformspezifisches Verhalten genutzt.
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Pressable, Platform } from "react-native";

// DateTimePicker zeigt die native Datumsauswahl an.
// formatDDMMYYYY formatiert ein Date-Objekt als deutsches Datum.
// UI/LAYOUT/COLORS/FONT_SIZE liefern Standard-Styles und Design-Konstanten.
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDDMMYYYY } from "../utils/datetime";
import { UI, LAYOUT, COLORS, FONT_SIZE } from "../constants";

export default function CreateDateScreen({ navigation, route }) {
  // showPicker steuert, ob der DatePicker angezeigt wird.
  const [showPicker, setShowPicker] = useState(false);

  // draft kommt aus dem vorherigen Screen und enthält die bisher gesammelten Daten.
  // Wenn nichts übergeben wurde, wird ein Standard-Draft erstellt.
  const draft = route?.params?.draft ?? { kind: "appointment", title: "", date: null, time: null };
  const [value, setValue] = useState(draft.date ?? "");

  // Wenn sich draft.date ändert, wird der lokale State value aktualisiert.
  // Dadurch bleibt die Anzeige synchron zu den Navigation-Params.
  useEffect(() => {
    setValue(draft.date ?? "");
  }, [draft.date]);

  // handleChange bekommt das ausgewählte Datum aus dem Picker.
  // Auf Android wird der Picker nach einer Auswahl direkt wieder geschlossen.
  // Das Datum wird formatiert, lokal gespeichert und zusätzlich in die Navigation-Params zurückgeschrieben.
  const handleChange = (_event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (!selectedDate) return;

    const newDate = formatDDMMYYYY(selectedDate);
    setValue(newDate);
    navigation.setParams({ draft: { ...draft, date: newDate } });
  };

  // Weiter geht es nur, wenn ein Datum gesetzt wurde.
  const canContinue = value && value.length > 0;

  // Navigation zum nächsten Schritt, dabei wird der Draft mit dem aktuellen Datum weitergegeben.
  const goNext = () => {
    if (!canContinue) return;
    navigation.navigate("CreateTime", { draft: { ...draft, date: value } });
  };

  // Layout nutzt UI.screen als Basis und setzt top/bottom Padding aus LAYOUT.
  // In der Mitte wird der aktuelle Wert angezeigt oder ein Hinweistext.
  // Der Picker wird nur gerendert, wenn showPicker true ist.
  // Auf iOS wird zusätzlich ein "Fertig"-Button angezeigt, um den Picker zu schließen.
  // Der Weiter-Button ist deaktiviert, solange kein Datum vorhanden ist.
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
            display={LAYOUT.datePickerDisplay}
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

// Styles für die Datumsauswahl:
// pickBox ist der klickbare Bereich, der den Picker öffnet.
// pickText steuert Farbe und Schriftgröße des angezeigten Datums oder Hinweistextes.
const styles = StyleSheet.create({
  pickBox: {
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: COLORS.surface,
  },
  pickText: { color: COLORS.textMuted, fontSize: FONT_SIZE.body },
});
