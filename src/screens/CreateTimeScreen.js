// React und Hooks für State und Nebenwirkungen.
// View/Text/Button/Pressable sind UI-Bausteine, Platform steuert plattformspezifisches Verhalten.
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Pressable, Platform } from "react-native";

// DateTimePicker zeigt die native Uhrzeitauswahl.
// formatHHMM formatiert ein Date-Objekt als Uhrzeit im Format HH:MM.
// UI/LAYOUT/COLORS/FONT_SIZE liefern Standard-Styles und Design-Konstanten.
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatHHMM } from "../utils/datetime";
import { UI, LAYOUT, COLORS, FONT_SIZE } from "../constants";

// useAuth liefert den eingeloggten User und den Ladezustand der Authentifizierung.
// saveDraft speichert den Draft in Firestore und plant je nach Typ eine lokale Notification ein.
import { useAuth } from "../context/AuthContext";
import { saveDraft } from "../services/saveDraft";

export default function CreateTimeScreen({ navigation, route }) {
  const { user, authLoading } = useAuth();

  // showPicker steuert, ob der TimePicker angezeigt wird.
  const [showPicker, setShowPicker] = useState(false);

  // draft kommt aus dem vorherigen Schritt, value hält die ausgewählte Uhrzeit als Text.
  const draft = route?.params?.draft ?? { kind: "appointment", title: "", date: null, time: null };
  const [value, setValue] = useState(draft.time ?? "");

  // saving sperrt den Button während des Speicherns, error zeigt Fehlermeldungen an.
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Wenn sich draft.time ändert, wird value aktualisiert, damit die Anzeige synchron bleibt.
  useEffect(() => setValue(draft.time ?? ""), [draft.time]);

  // handleChange bekommt die ausgewählte Zeit aus dem Picker.
  // Auf Android wird der Picker nach einer Auswahl direkt geschlossen.
  // Die Zeit wird formatiert, lokal gespeichert und zusätzlich in die Navigation-Params geschrieben.
  const handleChange = (_event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (!selectedDate) return;

    const newTime = formatHHMM(selectedDate);
    setValue(newTime);
    navigation.setParams({ draft: { ...draft, time: newTime } });
  };

  // Weiter geht es nur, wenn eine Zeit gesetzt wurde und gerade nichts gespeichert wird.
  // authLoading wird zusätzlich berücksichtigt, damit nicht gespeichert wird, bevor der User bereit ist.
  const canContinue = value && value.length > 0 && !saving && !authLoading;

  // goNext speichert den Draft endgültig.
  // Bei Erfolg wird die Navigation zurückgesetzt und Welcome bekommt eine Toast-Nachricht.
  // Bei Fehlern wird eine Meldung angezeigt, saving wird in jedem Fall wieder zurückgesetzt.
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

  // Layout nutzt UI.screen als Basis und setzt top/bottom Padding aus LAYOUT.
  // Pressable öffnet den Picker, der aktuelle Wert oder ein Hinweistext wird angezeigt.
  // Auf iOS gibt es zusätzlich einen "Fertig"-Button, um den Picker zu schließen.
  // Der Hauptbutton zeigt während saving einen anderen Text und ist dann deaktiviert.
  // Eine Fehlermeldung wird nur gerendert, wenn error gesetzt ist.
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

// Styles für die Auswahlbox und Fehlermeldung.
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
