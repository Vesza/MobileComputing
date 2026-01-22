import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { COLORS, FONT_SIZE, FONT_WEIGHT, UI, LAYOUT } from "../constants";

export default function Toast({ visible, message }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start();

    return () => {
      opacity.setValue(0);
      y.setValue(12);
    };
  }, [visible, opacity, y]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[UI.bordered, styles.toast, { opacity, transform: [{ translateY: y }] }]}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: (LAYOUT?.offsets?.bottom ?? 0) + 16,
    alignItems: "center",
  },
  toast: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
  },
  text: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
  },
});
