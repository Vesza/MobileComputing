// React wird für die Komponente benötigt, useState für lokale Zustände (Modal offen/Loading),
// useCallback für eine stabile Confirm-Funktion.
// Pressable/Text sind UI-Bausteine, StyleSheet enthält die Styles.
import React, { useState, useCallback } from "react";
import { Pressable, Text, StyleSheet } from "react-native";

// ConfirmModal ist das Bestätigungs-Modal für den Logout.
// useAuth liefert die logout-Funktion aus dem AuthContext.
// COLORS/FONT_SIZE/FONT_WEIGHT/UI liefern Design-Konstanten und Standard-Styles.
import ConfirmModal from "./ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { COLORS, FONT_SIZE, FONT_WEIGHT, UI } from "../constants";

export default function HeaderLogoutButton() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Wird aufgerufen, wenn im Modal "Ja" gedrückt wird.
  // loading sorgt dafür, dass der Button nicht mehrfach ausgelöst wird.
  // Nach erfolgreichem Logout wird das Modal geschlossen.
  const onConfirm = useCallback(async () => {
    try {
      setLoading(true);
      await logout();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // UI-Aufbau:
  // Ein Pressable-Button im Header öffnet das Modal.
  // hitSlop vergrößert den tappbaren Bereich, damit der Button leichter zu treffen ist.
  // ConfirmModal wird eingeblendet, sobald open true ist, und nutzt loading für deaktivierte Aktionen.
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[UI.bordered, styles.btn]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.text}>Logout</Text>
      </Pressable>

      <ConfirmModal
        visible={open}
        title="Logout?"
        subtitle="Willst du dich wirklich abmelden?"
        loading={loading}
        onCancel={() => (loading ? null : setOpen(false))}
        onConfirm={onConfirm}
        confirmText="Ja"
        denyText="Nein"
        cancelText="Abbrechen"
      />
    </>
  );
}

// Styles für den Header-Button:
// btn definiert Padding, Hintergrund und Rundungen.
// text setzt Farbe, Schriftgröße und Gewicht passend zum restlichen Design.
const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  text: {
    color: COLORS.text,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
  },
});
