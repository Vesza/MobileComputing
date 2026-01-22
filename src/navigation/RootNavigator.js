import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
  },
};

export default function RootNavigator() {
  const { user, emailVerified, authLoading } = useAuth();

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

  return (
    <NavigationContainer theme={navTheme}>
      {user && emailVerified ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
