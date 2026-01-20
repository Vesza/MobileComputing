import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import CalendarScreen from "../screens/CalendarScreen";

import CreateTitleScreen from "../screens/CreateTitleScreen";
import CreateDateScreen from "../screens/CreateDateScreen";
import CreateTimeScreen from "../screens/CreateTimeScreen";
import CreateDurationScreen from "../screens/CreateDurationScreen";
import CreateSuccessScreen from "../screens/CreateSuccessScreen";

import DetailScreen from "../screens/DetailScreen";

import QuickActionsScreen from "../screens/QuickActionsScreen";
import RemindersScreen from "../screens/RemindersScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: "white" } }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ animation: "fade" }}
      />

      {/* 1 DetailScreen für alles */}
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />

      {/* Create flow (Appointment/Reminder/Notification) */}
      <Stack.Screen name="CreateTitle" component={CreateTitleScreen} />
      <Stack.Screen name="CreateDate" component={CreateDateScreen} />
      <Stack.Screen name="CreateTime" component={CreateTimeScreen} />
      <Stack.Screen name="CreateDuration" component={CreateDurationScreen} />
      <Stack.Screen name="CreateSuccess" component={CreateSuccessScreen} />

      {/* Quick actions modal */}
      <Stack.Screen
        name="QuickActions"
        component={QuickActionsScreen}
        options={{ presentation: "modal", title: "Aktionen" }}
      />

      {/* Lists */}
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
