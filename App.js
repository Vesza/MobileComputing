
//Firebase feature test

import { View, Button, Text } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./FirebaseConfig";
import { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./FirebaseConfig";

export default function App() {
  const [status, setStatus] = useState("Idle");

  const testAuth = async () => {
    try {
      setStatus("Signing up...");
      await createUserWithEmailAndPassword(
        auth,
        "testuser123@test.com",
        "TestPassword123!"
      );
      setStatus("Signup OK");
    } catch (e) {
      setStatus("Signup error: " + e.code);
    }

    try {
      setStatus("Signing in...");
      await signInWithEmailAndPassword(
        auth,
        "testuser123@test.com",
        "TestPassword123!"
      );
      setStatus("Login OK");
    } catch (e) {a
      setStatus("Login error: " + e.code);
    }
  };

    const testFirestore = async () => {
  try {
    const ref = doc(db, "testCollection", "testDoc");
    await setDoc(ref, {
      message: "Hello Firestore",
      createdAt: Date.now(),
    });

    const snap = await getDoc(ref);
    console.log("Firestore data:", snap.data());
  } catch (e) {
    console.log("Firestore error:", e);
  }
};

  return (
    <View style={{ marginTop: 80, padding: 20 }}>
      <Button title="Test Firebase Auth" onPress={testAuth} />
      <Button title="Test Firestore" onPress={testFirestore} />
      <Text>{status}</Text>
    </View>
  );



}

// Main
/*import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Hello World</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});*/
