import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Platform } from "react-native";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;

export default function NotificationCreateTextScreen({ navigation }) {
  const [text, setText] = useState("");

  const canContinue = text.trim().length > 0;

  const goNext = () => {
    if (!canContinue) return;

    navigation.navigate("NotificationCreateDate", {
      draft: {
        text: text.trim(),
        date: null,
        time: null,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.heading}>Notification Text</Text>

        <TextInput
          placeholder="Text..."
          value={text}
          onChangeText={setText}
          style={[styles.input, styles.inputMulti]}
          multiline
          textAlignVertical="top"
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
        onPress={() => navigation.goBack()}
        style={[styles.bottomPressable, styles.left]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.bottomLinkText}>Zurück</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("Welcome")}
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
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  inputMulti: { height: 180 },

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
