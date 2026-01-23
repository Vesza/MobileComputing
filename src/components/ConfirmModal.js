// React wird für die Komponente benötigt.
// Modal/Pressable/Text/View sind UI-Bausteine für ein Overlay mit klickbaren Bereichen.
// StyleSheet wird für die Styles genutzt.
import React from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { COLORS } from "../constants";

// ConfirmModal ist ein wiederverwendbares Bestätigungs-Modal.
// visible steuert, ob es angezeigt wird.
// title/subtitle sind die Texte im Modal.
// loading deaktiviert Buttons und zeigt einen "Lösche..."-Text an.
// onCancel und onConfirm sind Callback-Funktionen für Abbrechen/Bestätigen.
// confirmText/denyText/cancelText sind anpassbare Button-Texte.
export default function ConfirmModal({
  visible,
  title,
  subtitle,
  loading = false,
  onCancel,
  onConfirm,
  confirmText = "Ja",
  denyText = "Nein",
  cancelText = "Abbrechen",
}) {
  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.box} onPress={() => {}}>
          <Text style={styles.title}>{title || "Bestätigen?"}</Text>

          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={3}>
              {subtitle}
            </Text>
          ) : null}

          <View style={{ height: 14 }} />

          <View style={styles.buttonsRow}>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={[
                styles.btn,
                styles.btnDanger,
                styles.btnLeft,
                loading && styles.btnDisabled,
              ]}
            >
              <Text style={styles.btnTextWhite}>
                {loading ? "Lösche..." : confirmText}
              </Text>
            </Pressable>

            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={[styles.btn, styles.btnNeutral, loading && styles.btnDisabled]}
            >
              <Text style={styles.btnTextDark}>{denyText}</Text>
            </Pressable>
          </View>

          <View style={{ height: 10 }} />

          <Pressable
            onPress={onCancel}
            disabled={loading}
            style={[
              styles.btn,
              styles.btnNeutral,
              styles.btnFull,
              loading && styles.btnDisabled,
            ]}
          >
            <Text style={styles.btnTextDark}>{cancelText}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Styles für das Modal:
// backdrop ist der abgedunkelte Hintergrund, der auch zum Schließen angetippt werden kann.
// box ist der eigentliche Dialog.
// buttonsRow ordnet die oberen zwei Buttons nebeneinander an.
// btn enthält Basis-Button-Styling, Varianten passen Farbe/Breite/Disabled an.
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  box: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 6, textAlign: "center" },
  subtitle: { color: "grey", textAlign: "center" },

  buttonsRow: { flexDirection: "row" },

  btn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    flex: 1,
  },
  btnLeft: { marginRight: 10 },
  btnFull: { flex: 0, width: "100%" },

  btnDanger: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  btnNeutral: { backgroundColor: "#f2f2f2", borderColor: "#ddd" },
  btnDisabled: { opacity: 0.6 },

  btnTextWhite: { color: "white", fontWeight: "bold" },
  btnTextDark: { color: "#333", fontWeight: "bold" },
});
