// React-Komponente für den Impressum-Screen.
// ScrollView wird genutzt, damit längere Texte gut lesbar bleiben.
// UI, LAYOUT und die Design-Konstanten kommen aus dem gemeinsamen constants-Ordner.
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function ImpressumScreen() {
  // Der Screen nutzt den Standard-Hintergrund und bekommt oben und unten Padding,
  // damit Inhalte nicht unter Statusbar oder unteren Systemleisten liegen.
  // Der eigentliche Inhalt liegt in einer ScrollView, damit das Impressum auch bei viel Text sauber scrollt.
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
          
         Appname:FastSchedule{"\n\n"}
          Kontakt:{"\n"}
          calogero.montante@stud.hs-ruhrwest.de{"\n"}
          regy.bejko@stud.hs-ruhrwest.de{"\n\n"}
          Weitere Hinweise:{"\n"}
          Die App verarbeitet Nutzerdaten zur Anmeldung und zur Speicherung von Terminen/Notifications.{"\n"}
          Mit der Nutzung der App erklärt die nutzende Person sich mit der Verarbeitung der Nutzerdaten einverstanden.{"\n"}
          Die Entwickler der App FastSchedule übernehmen keinerlei Haftung für jedwede Form von Schäden, die direkt oder indirekt durch die Nutzung der App entstanden sind.{"\n\n"}
          Die Verbreitung des Quellcodes an dritte Personen außerhalb des Hochschulkontextes der {"\n"}
          Hochschule-Ruhr-West, erfordert eine vorherige Erlaubnis der Entwickler.{"\n\n"}
          Calogero Montante & Regy Bejko{"\n\n"}
          © 2026
         
        </Text>
      </ScrollView>
    </View>
  );
}

// Styles für Layout und Typografie des Impressums.
// container setzt die horizontale Innenabstände, title und text definieren Schrift und Farben.
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
