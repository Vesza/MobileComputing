import React from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Platform } from "react-native";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;

export default function CreateTitleScreen({ value, setValue, goBack, goHome, goNext }) {
  const canContinue = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.heading}>Titel eingeben</Text>

        <TextInput
          placeholder="Titel"
          value={value}
          onChangeText={setValue}
          style={styles.input}
        />

        <Pressable
          onPress={canContinue ? goNext : null}
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
        >
          <Text style={[styles.nextBtnText, !canContinue && styles.nextBtnTextDisabled]}>
            Weiter
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={goBack}
        style={[styles.bottomPressable, styles.left]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.bottomLinkText}>Zurück</Text>
      </Pressable>

      <Pressable
        onPress={goHome}
        style={[styles.bottomPressable, styles.right]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.bottomLinkText}>Welcome</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center" },

  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },

  nextBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  nextBtnDisabled: { backgroundColor: "#ccc" },
  nextBtnText: { color: "white", fontWeight: "bold" },
  nextBtnTextDisabled: { color: "#888" },

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
