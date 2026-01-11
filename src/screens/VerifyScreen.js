import { View, Text, Button, StyleSheet } from "react-native";

export default function VerifyScreen({ email, goToLogin }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Bestätigungslink wurde an{"\n"}{email} gesendet!
      </Text>

      <Button title="Weiter" onPress={goToLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",   
    alignItems: "center",       
    padding: 20,
  },
  text: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
});
