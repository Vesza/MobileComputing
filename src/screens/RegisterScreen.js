import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, db } from "../services/FirebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { UI, LAYOUT, COLORS, FONT_SIZE, FONT_WEIGHT } from "../constants";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [status, setStatus] = useState("");
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

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
        lastLoginAt: null,
        emailVerified: user.emailVerified,
      });

      await sendEmailVerification(user);
      await signOut(auth);

      setPw("");
      setPw2("");
      setStatus("");

      navigation.navigate("Verify", { email: email.trim() });
    } catch (e) {
      console.log("Registrierungs-Fehler:", e);

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
