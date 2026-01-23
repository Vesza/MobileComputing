// React Hooks werden genutzt, um Eingaben und Status im Screen zu verwalten.
// useRef hält hier einen Timer fest, damit Statusmeldungen nach ein paar Sekunden wieder verschwinden.
import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

// Firebase Auth wird für den Login und das erneute Senden der Verifizierungs-Mail verwendet.
// Firestore wird genutzt, um nach erfolgreichem Login einen Zeitstempel im User-Dokument zu speichern.
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../services/FirebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Gemeinsame Styles und Layout-Abstände aus den Konstanten.
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function LoginScreen({ navigation }) {
  // State für die beiden Eingabefelder und eine Statusmeldung unter den Buttons.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState("");

  // showResend steuert, ob der Link zum erneuten Senden der Bestätigungsmail angezeigt wird.
  // pendingVerifyUser speichert das Firebase-User-Objekt, wenn der Account noch nicht verifiziert ist.
  const [showResend, setShowResend] = useState(false);
  const [pendingVerifyUser, setPendingVerifyUser] = useState(null);

  // Referenz auf einen Timeout, damit sich Statusmeldungen automatisch zurücksetzen lassen.
  const statusTimerRef = useRef(null);

  // Cleanup: Wenn der Screen verlassen wird, wird ein laufender Timer entfernt,
  // damit kein setState mehr nach dem Unmount passiert.
  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  // Hilfsfunktion für Statusmeldungen, die nach 5 Sekunden wieder verschwinden.
  // Vorher wird ein eventuell laufender Timer abgebrochen, damit Nachrichten nicht durcheinander laufen.
  const showTemporaryStatus = (message) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);

    setStatus(message);
    statusTimerRef.current = setTimeout(() => {
      setStatus("");
      statusTimerRef.current = null;
    }, 5000);
  };

  // Login-Logik:
  // 1) Prüfen, ob E-Mail und Passwort vorhanden sind
  // 2) Mit Firebase anmelden
  // 3) User neu laden, damit emailVerified sicher aktuell ist
  // 4) Wenn nicht verifiziert, zum Verify-Screen wechseln und Resend-Option anzeigen
  // 5) Wenn verifiziert, Login-Zeitpunkt im Firestore speichern
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

      await user.reload();

      if (!user.emailVerified) {
        setPendingVerifyUser(user); // store user
        showTemporaryStatus("E-Mail muss noch bestätigt werden.");
        setShowResend(true);
        navigation.navigate("Verify", { email: user.email ?? email.trim() });
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

      // Standard-Fehlermeldung, die je nach Firebase Error-Code konkreter gemacht wird.
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

  // Erneutes Senden der Verifizierungs-Mail.
  // Das geht nur, wenn vorher ein nicht-verifizierter User gespeichert wurde.
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

  // UI:
  // Eingabefelder für E-Mail und Passwort, Buttons für Login und Wechsel zur Registrierung.
  // Optional wird ein Link angezeigt, um den Bestätigungslink erneut zu senden.
  // Unten wird eine Statusmeldung eingeblendet, wenn eine vorhanden ist.
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

// Styles für Layout und Farben des Login-Screens.
// container zentriert den Inhalt, input formatiert die Textfelder, status und link sind für Hinweise unter den Buttons.
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
