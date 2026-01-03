import { View, Text, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function WelcomeScreen({ goToLogin }) {
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
      <View style={styles.centerContent}>
        <Text style={styles.title}>Willkommen zu unserer App</Text>
      </View>

      <Text style={styles.logoutLink} onPress={handleLogout}>
        Logout
      </Text>
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  logoutLink: {
    position: "absolute",
    left: 20,
    bottom: 40,   // etwas höher, gut klickbar
    color: "grey",
    textDecorationLine: "underline",
  },
});
