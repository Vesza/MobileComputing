import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import CreateTitleScreen from "../screens/CreateTitleScreen";
import CreateDateScreen from "../screens/CreateDateScreen";
import CreateTimeScreen from "../screens/CreateTimeScreen";
import CreateSuccessScreen from "../screens/CreateSuccessScreen";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="CreateTitle" component={CreateTitleScreen} />
      <Stack.Screen name="CreateDate" component={CreateDateScreen} />
      <Stack.Screen name="CreateTime" component={CreateTimeScreen} />
      <Stack.Screen name="CreateSuccess" component={CreateSuccessScreen} />
    </Stack.Navigator>
  );
}
