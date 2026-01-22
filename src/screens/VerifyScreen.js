import { useCallback, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../services/FirebaseConfig";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function VerifyScreen({ navigation, route }) {
  const emailFromRoute = route?.params?.email ?? "";
  const email = auth.currentUser?.email ?? emailFromRoute ?? "";
  const isSignedIn = !!auth.currentUser;

  const [status, setStatus] = useState("");

  const handleResend = useCallback(async () => {
    try {
      const u = auth.currentUser;
      if (!u) {
        setStatus("Bitte zuerst anmelden.");
        return;
      }
      await sendEmailVerification(u);
      setStatus("Bestätigungslink erneut gesendet.");
    } catch (e) {
      console.log("Verify resend error:", e);
      setStatus("Konnte Bestätigungsmail nicht senden.");
    }
  }, []);

  const handleCheck = useCallback(async () => {
    try {
      const u = auth.currentUser;
      if (!u) {
        navigation.navigate("Login");
        return;
      }

      // emailVerified wird nicht automatisch gepusht → manuell refreshen
      await u.reload();
      await u.getIdToken(true);

      setStatus(
        u.emailVerified
          ? "E-Mail bestätigt!"
          : "Noch nicht bestätigt. Bitte Link in deiner E-Mail anklicken."
      );
      // Wenn bestätigt: RootNavigator wechselt automatisch in den AppStack.
    } catch (e) {
      console.log("Verify check error:", e);
      setStatus("Konnte Status nicht prüfen.");
    }
  }, [navigation]);

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
        <Text style={styles.email}>{email || "-"}</Text> gesendet!
      </Text>

      <View style={{ height: 10 }} />

      {isSignedIn ? (
        <>
          <Button title="Ich habe bestätigt" onPress={handleCheck} />
          <View style={{ height: 10 }} />
          <Button title="Link erneut senden" onPress={handleResend} />
        </>
      ) : (
        <Button title="Zum Login" onPress={() => navigation.navigate("Login")} />
      )}

      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: FONT_SIZE.body,
    color: COLORS.textMuted,
    lineHeight: 22,
  },

  email: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },

  status: {
    marginTop: 12,
    textAlign: "center",
    color: COLORS.textMuted,
  },
});
