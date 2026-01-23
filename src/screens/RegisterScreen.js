// React Hooks für State, Effekte und Ref für Timer-Verwaltung.
import { useEffect, useRef, useState } from "react";

// React Native UI-Bausteine für Layout, Eingaben, Buttons und Styles.
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

// Firebase Auth Funktionen für Registrierung, Verifizierungsmail und Abmelden nach Registrierung.
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

// Firebase-Instanzen für Auth und Firestore.
import { auth, db } from "../services/FirebaseConfig";

// Firestore Helpers zum Anlegen/Aktualisieren eines User-Dokuments mit Server-Zeitstempel.
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Zentrale Styles und Konstanten für Layout und Typografie.
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function RegisterScreen({ navigation }) {
  // Eingabefelder für E-Mail und zwei Passwortfelder, plus Statusmeldung für Feedback.
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [status, setStatus] = useState("");

  // Ref hält den Timer, um Statusmeldungen nach kurzer Zeit wieder zu entfernen.
  const statusTimerRef = useRef(null);

  // Cleanup: Timer beim Verlassen des Screens stoppen, damit kein setState nach Unmount passiert.
  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  // Zeigt eine Statusmeldung für eine feste Dauer und ersetzt eine vorherige Meldung sauber.
  const showTemporaryStatus = (message) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);

    setStatus(message);
    statusTimerRef.current = setTimeout(() => {
      setStatus("");
      statusTimerRef.current = null;
    }, 5000);
  };

  // Registrierung: Eingaben prüfen, Account anlegen, User-Dokument schreiben, Verifizierungsmail senden.
  // Danach wird bewusst abgemeldet und auf den Verify-Screen weitergeleitet.
  const handleRegister = async () => {
    if (!email || !pw || !pw2) {
      showTemporaryStatus("Bitte alle Felder ausfüllen.");
      return;
    }
    if (pw !== pw2) {
      showTemporaryStatus("Passwörter stimmen nicht überein.");
      return;
    }

    try {
      setStatus("Account wird erstellt...");

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      const user = cred.user;

      // User-Dokument in Firestore: Basisdaten + Zeitstempel.
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
        lastLoginAt: null,
        emailVerified: user.emailVerified,
      });

      // Verifizierungslink senden und Session beenden, damit der Login-Flow sauber bleibt.
      await sendEmailVerification(user);
      await signOut(auth);

      // Lokale Felder und Status zurücksetzen.
      setPw("");
      setPw2("");
      setStatus("");

      // Wechsel zum Verify-Screen, E-Mail wird zur Anzeige übergeben.
      navigation.navigate("Verify", { email: email.trim() });
    } catch (e) {
      console.log("Registrierungs-Fehler:", e);

      // Fehlermeldungen anhand typischer Firebase Auth Codes.
      let message = "Registrierung fehlgeschlagen.";

      if (e.code === "auth/email-already-in-use") {
        message = "Diese E-Mail wird bereits verwendet.";
      } else if (e.code === "auth/invalid-email") {
        message = "Ungültige E-Mail-Adresse.";
      } else if (e.code === "auth/weak-password") {
        message = "Passwort ist zu schwach (mind. 6 Zeichen).";
      }

      showTemporaryStatus(message);
    }
  };

  // UI: Formular mit drei Inputs, zwei Buttons und optionaler Statusmeldung.
  // Padding berücksichtigt Safe-Areas über LAYOUT.offsets.
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
        <Text style={styles.heading}>Registrieren</Text>

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
          value={pw}
          onChangeText={setPw}
          style={[UI.bordered, styles.input]}
        />

        <TextInput
          placeholder="Passwort wiederholen"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={pw2}
          onChangeText={setPw2}
          style={[UI.bordered, styles.input]}
        />

        <Button title="Weiter" onPress={handleRegister} />
        <View style={{ height: 10 }} />
        <Button title="Zurück zum Login" onPress={() => navigation.navigate("Login")} />

        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>
    </View>
  );
}

// Styles: Container zentriert den Inhalt, Inputs haben Oberfläche/Border und Status ist dezent.
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
});
