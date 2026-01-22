import { View, Text, Button, StyleSheet } from "react-native";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function VerifyScreen({ navigation, route }) {
  const email = route?.params?.email ?? "";

  return (
    <View
      style={[
        UI.screenCenter,
        {
          paddingTop: LAYOUT.offsets.top,
          paddingBottom: LAYOUT.offsets.bottom,
        },
      ]}
    >
      <Text style={styles.text}>
        Bestätigungslink wurde an{"\n"}
        <Text style={styles.email}>{email || "-"}</Text>{" "}
        gesendet!
      </Text>

      <Button title="Weiter" onPress={() => navigation.navigate("Login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
    lineHeight: 22,
  },

  email: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },
});
