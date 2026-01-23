// React wird für die Komponente benötigt.
// View/Text werden für den einfachen Ladezustand verwendet.
// NavigationContainer ist der Rahmen für React Navigation.
// DefaultTheme dient als Basis-Theme, das anschließend angepasst wird.
import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

// useAuth liefert den aktuellen Login-Status und ob die E-Mail verifiziert ist.
// COLORS liefert die App-Farben.
// AuthStack ist der Stack für Login/Registrierung/Verify.
// AppStack ist der Stack für die eigentliche App nach dem Login.
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";

// Theme-Anpassung für die Navigation.
// DefaultTheme wird übernommen und die Hintergrundfarbe wird auf die App-Farbe gesetzt.
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
  },
};

export default function RootNavigator() {
  const { user, emailVerified, authLoading } = useAuth();

  // Während Firebase den Auth-Status noch lädt, wird ein einfacher Ladebildschirm angezeigt.
  // Dadurch wird vermieden, dass kurz der falsche Stack gerendert wird.
  if (authLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <Text>Loading session...</Text>
      </View>
    );
  }

  // NavigationContainer umschließt die gesamte Navigation.
  // Wenn ein User eingeloggt ist und die E-Mail bestätigt wurde, wird AppStack gezeigt.
  // Andernfalls wird der AuthStack angezeigt.
  return (
    <NavigationContainer theme={navTheme}>
      {user && emailVerified ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
