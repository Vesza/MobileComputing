import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../services/FirebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [pendingVerifyUser, setPendingVerifyUser] = useState(null);
  const statusTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  const showTemporaryStatus = (message) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);

    setStatus(message);
    statusTimerRef.current = setTimeout(() => {
      setStatus("");
      statusTimerRef.current = null;
    }, 5000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showTemporaryStatus("Bitte E-Mail und Passwort eingeben.");
      setShowResend(false);
      setPendingVerifyUser(null);
      return;
    }

    try {
      setStatus("Melde an...");
      setShowResend(false);
      setPendingVerifyUser(null);

      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;

      if (!user.emailVerified) {
        setPendingVerifyUser(user); //  store user
        showTemporaryStatus("E-Mail muss noch bestätigt werden.");
        setShowResend(true);
        return;
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          lastLoginAt: serverTimestamp(),
          emailVerified: user.emailVerified,
        },
        { merge: true }
      );

      setStatus("");
      setShowResend(false);
      setPendingVerifyUser(null);
      // RootNavigator switches to AppStack automatically.
    } catch (e) {
      console.log("Login-Fehler:", e);

      let message = "Login fehlgeschlagen.";

      if (e.code === "auth/user-not-found") {
        message = "Nutzer ist nicht vorhanden.";
      } else if (e.code === "auth/wrong-password") {
        message = "Falsches Passwort.";
      } else if (e.code === "auth/invalid-email") {
        message = "Ungültige E-Mail-Adresse.";
      } else if (e.code === "auth/too-many-requests") {
        message = "Zu viele Versuche. Bitte später erneut versuchen.";
      }

      showTemporaryStatus(message);
      setShowResend(false);
      setPendingVerifyUser(null);
    }
  };

  const handleResendMail = async () => {
    try {
      if (!pendingVerifyUser) {
        showTemporaryStatus("Bitte zuerst anmelden.");
        return;
      }

      await sendEmailVerification(pendingVerifyUser);
      showTemporaryStatus("Bestätigungsmail erneut gesendet.");
    } catch (e) {
      console.log("Resend-Fehler:", e);
      showTemporaryStatus("Konnte Bestätigungsmail nicht senden. Bitte später erneut versuchen.");
    }
  };

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
      <View style={styles.box}>
        <Text style={styles.heading}>Login</Text>

        <TextInput
          placeholder="E-Mail"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={[UI.bordered, styles.input]}
        />

        <TextInput
          placeholder="Passwort"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[UI.bordered, styles.input]}
        />

        <Button title="Anmelden" onPress={handleLogin} />
        <View style={{ height: 10 }} />
        <Button title="Registrieren" onPress={() => navigation.navigate("Register")} />

        {showResend && (
          <Text style={styles.link} onPress={handleResendMail}>
            Bestätigungslink erneut senden
          </Text>
        )}

        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  box: {},
  heading: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 12,
    color: COLORS.text,
  },
  input: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  status: {
    marginTop: 10,
    color: COLORS.textMuted,
  },
  link: {
    marginTop: 8,
    color: COLORS.textMuted,
    textDecorationLine: "underline",
  },
});
