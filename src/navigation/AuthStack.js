// React wird für die Komponente benötigt.
// createNativeStackNavigator erstellt einen Stack-Navigator für den Auth-Bereich.
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens für den Auth-Flow:
// Login für Anmeldung, Register für Registrierung, Verify für E-Mail-Bestätigung.
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyScreen from "../screens/VerifyScreen";

// Stack-Instanz für den Auth-Bereich.
const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    // headerShown: false blendet den Header auf allen Auth-Screens aus.
    // Damit bleiben Login/Register/Verify optisch einfach und ohne Standard-Navigation oben.
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
    </Stack.Navigator>
  );
}
