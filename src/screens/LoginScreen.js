import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../services/FirebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [showResend, setShowResend] = useState(false);
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
      return;
    }

    try {
      setStatus("Melde an...");
      setShowResend(false);

      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = cred.user;

      if (!user.emailVerified) {
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

      // DO NOT navigate to Welcome here.
      // RootNavigator will switch to AppStack automatically.
      setStatus("");
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
    }
  };

  const handleResendMail = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        showTemporaryStatus(
          "Bitte zuerst E-Mail und Passwort eingeben und anmelden."
        );
        return;
      }

      await sendEmailVerification(user);
      showTemporaryStatus("Bestätigungsmail erneut gesendet.");
    } catch (e) {
      console.log("Resend-Fehler:", e);
      showTemporaryStatus(
        "Konnte Bestätigungsmail nicht senden. Bitte später erneut versuchen."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.heading}>Login</Text>

        <TextInput
          placeholder="E-Mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Passwort"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Button title="Anmelden" onPress={handleLogin} />
        <View style={{ height: 10 }} />
        <Button
          title="Registrieren"
          onPress={() => navigation.navigate("Register")}
        />

        {showResend && (
          <Text
            style={styles.link}
            onPress={handleResendMail}
          >
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
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  box: {},
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
  status: {
    marginTop: 10,
    color: "grey",
  },
  link: {
    marginTop: 8,
    color: "grey",
    textDecorationLine: "underline",
  },
});
