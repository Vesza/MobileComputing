import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Pressable, Platform } from "react-native";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/FirebaseConfig";

const BOTTOM_OFFSET = Platform.OS === "android" ? 80 : 40;

export default function WelcomeScreen({ goToLogin, goToCreate, goToCalendar }) {
  const [userEmail, setUserEmail] = useState(auth.currentUser?.email ?? "");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? "");
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log("Logout-Fehler:", e);
    } finally {
      goToLogin();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.loggedInText}>Eingeloggt mit: {userEmail || "-"}</Text>

      <View style={styles.centerContent}>
        <View style={{ width: "100%" }}>
          <Button title="Neuen Termin anlegen" onPress={goToCreate} />
          <View style={{ height: 12 }} />
          <Button title="Kalender ansehen" onPress={goToCalendar} />
        </View>
      </View>

      {/* Logout: großer unsichtbarer Button hinter dem Text */}
      <Pressable
        onPress={handleLogout}
        style={styles.bottomLeftPressable}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.bottomLinkText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loggedInText: {
    position: "absolute",
    left: 20,
    top: 50,
    color: "grey",
    textDecorationLine: "underline",
  },

  bottomLeftPressable: {
    position: "absolute",
    left: 10,
    bottom: BOTTOM_OFFSET,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 140,
    minHeight: 56,
    justifyContent: "center",
  },

  bottomLinkText: {
    color: "grey",
    textDecorationLine: "underline",
  },
});
