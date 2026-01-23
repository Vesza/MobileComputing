import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import CalendarScreen from "../screens/CalendarScreen";

import CreateTitleScreen from "../screens/CreateTitleScreen";
import CreateDateScreen from "../screens/CreateDateScreen";
import CreateTimeScreen from "../screens/CreateTimeScreen";

import DetailScreen from "../screens/DetailScreen";

import QuickActionsScreen from "../screens/QuickActionsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import { COLORS } from "../constants";
import HeaderLogoutButton from "../components/HeaderLogoutButton";
import ImpressumScreen from "../screens/ImpressumScreen";





const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
  screenOptions={{
    contentStyle: { backgroundColor: COLORS.background },
    headerRight: () => <HeaderLogoutButton />,
  }}
>

      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ animation: "fade" }}
      />
   
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="CreateTitle" component={CreateTitleScreen} />
      <Stack.Screen name="CreateDate" component={CreateDateScreen} />
      <Stack.Screen name="CreateTime" component={CreateTimeScreen} />
      <Stack.Screen name="Impressum" component={ImpressumScreen} options={{title: "Impressum",headerRight: () => null, headerShown: false}}/>


  
      <Stack.Screen
        name="QuickActions"
        component={QuickActionsScreen}
        options={{ presentation: "modal", title: "Aktionen" }}
      />


      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
