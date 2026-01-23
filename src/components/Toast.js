// React wird für die Komponente benötigt.
// useEffect steuert die Animation beim Einblenden, useRef hält die Animated.Values stabil über Renders hinweg.
// Animated ermöglicht einfache Ein-/Ausblend- und Slide-Animationen.
// StyleSheet/Text/View sind UI-Bausteine.
// Constants liefern Farben, Schriftgrößen und Standard-Styles sowie Abstände (LAYOUT).
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { COLORS, FONT_SIZE, FONT_WEIGHT, UI, LAYOUT } from "../constants";

export default function Toast({ visible, message }) {
  // opacity und y sind Animationswerte.
  // opacity startet bei 0 (unsichtbar), y startet bei 12 (leicht nach unten versetzt).
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(12)).current;

  // Sobald visible true wird, wird parallel animiert:
  // opacity geht auf 1 und y geht auf 0, wodurch der Toast weich einblendet und leicht nach oben "einschwebt".
  // Beim Cleanup werden die Werte zurückgesetzt, damit beim nächsten Anzeigen wieder von vorne gestartet wird.
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

  // Wenn visible false ist, wird gar nichts gerendert.
  if (!visible) return null;

  // pointerEvents="none" sorgt dafür, dass der Toast keine Klicks/Taps abfängt.
  // Das Animated.View nutzt die UI-Border-Styles und setzt opacity + translateY aus den Animationswerten.
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[UI.bordered, styles.toast, { opacity, transform: [{ translateY: y }] }]}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

// Styles für Position und Aussehen:
// wrap positioniert den Toast absolut am unteren Rand, mit Abstand zum Bottom-Offset (z.B. wegen Home Indicator).
// toast definiert die Kartenoptik (Breite, Padding, Hintergrund).
// text setzt die Schrift zentriert und in der Standard-Farbwelt.
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
