import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { BOTTOM_OFFSET } from "../constants/layout";

export default function BottomLinks({
  leftLabel = "Zurück",
  rightLabel = "Welcome",
  onLeftPress,
  onRightPress,
}) {
  return (
    <>
      <Pressable
        onPress={onLeftPress}
        style={[styles.bottomPressable, styles.left]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.linkText}>{leftLabel}</Text>
      </Pressable>

      <Pressable
        onPress={onRightPress}
        style={[styles.bottomPressable, styles.right]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.linkText}>{rightLabel}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  bottomPressable: {
    position: "absolute",
    bottom: BOTTOM_OFFSET,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 140,
    minHeight: 56,
    justifyContent: "center",
  },
  linkText: { color: "grey", textDecorationLine: "underline" },
  left: { left: 10 },
  right: { right: 10, alignItems: "flex-end" },
});
