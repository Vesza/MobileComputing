import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function ImpressumScreen() {
  return (
    <View
      style={[
        UI.screen,
        styles.container,
        {
          paddingTop: LAYOUT.offsets.top,
          paddingBottom: LAYOUT.offsets.bottom,
        },
      ]}
    >
      <ScrollView>
        <Text style={styles.title}>Impressum</Text>

        <Text style={styles.text}>
          
          Appname{"\n\n"}
          Kontakt:email{"\n"}
          andere infos{"\n"}
          unsere namen{"\n\n"}
          © 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: FONT_WEIGHT.normal,
    marginBottom: 12,
    color: COLORS.text,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
});
