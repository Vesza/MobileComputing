import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import CreateTitleScreen from "../screens/CreateTitleScreen";
import CreateDateScreen from "../screens/CreateDateScreen";
import CreateTimeScreen from "../screens/CreateTimeScreen";
import CreateSuccessScreen from "../screens/CreateSuccessScreen";
import AppointmentDetailScreen from "../screens/AppointmentDetailScreen";

import QuickActionsScreen from "../screens/QuickActionsScreen";
import RemindersScreen from "../screens/RemindersScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import SettingsScreen from "../screens/SettingsScreen";

// Reminder one-screen-at-a-time
import ReminderCreateTitleScreen from "../screens/ReminderCreateTitleScreen";
import ReminderCreateDateScreen from "../screens/ReminderCreateDateScreen";
import ReminderCreateTimeScreen from "../screens/ReminderCreateTimeScreen";
import ReminderCreateDurationScreen from "../screens/ReminderCreateDurationScreen";
import ReminderCreateSuccessScreen from "../screens/ReminderCreateSuccessScreen";

// Notification one-screen-at-a-time
import NotificationCreateTextScreen from "../screens/NotificationCreateTextScreen";
import NotificationCreateDateScreen from "../screens/NotificationCreateDateScreen";
import NotificationCreateTimeScreen from "../screens/NotificationCreateTimeScreen";
import NotificationCreateDurationScreen from "../screens/NotificationCreateDurationScreen";
import NotificationCreateSuccessScreen from "../screens/NotificationCreateSuccessScreen";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: "white" }, 
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      {}
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ animation: "fade" }}
      />

      <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ headerShown: false }}
      />

      {/* Existing appointment flow */}
      <Stack.Screen name="CreateTitle" component={CreateTitleScreen} />
      <Stack.Screen name="CreateDate" component={CreateDateScreen} />
      <Stack.Screen name="CreateTime" component={CreateTimeScreen} />
      <Stack.Screen name="CreateSuccess" component={CreateSuccessScreen} />

      {/* Modal quick actions */}
      <Stack.Screen
        name="QuickActions"
        component={QuickActionsScreen}
        options={{ presentation: "modal", title: "Aktionen" }}
      />

      {/* Lists */}
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* Reminder flow */}
      <Stack.Screen name="ReminderCreateTitle" component={ReminderCreateTitleScreen} />
      <Stack.Screen name="ReminderCreateDate" component={ReminderCreateDateScreen} />
      <Stack.Screen name="ReminderCreateTime" component={ReminderCreateTimeScreen} />
      <Stack.Screen name="ReminderCreateDuration" component={ReminderCreateDurationScreen} />
      <Stack.Screen name="ReminderCreateSuccess" component={ReminderCreateSuccessScreen} />

      {/* Notification flow */}
      <Stack.Screen name="NotificationCreateText" component={NotificationCreateTextScreen} />
      <Stack.Screen name="NotificationCreateDate" component={NotificationCreateDateScreen} />
      <Stack.Screen name="NotificationCreateTime" component={NotificationCreateTimeScreen} />
      <Stack.Screen name="NotificationCreateDuration" component={NotificationCreateDurationScreen} />
      <Stack.Screen name="NotificationCreateSuccess" component={NotificationCreateSuccessScreen} />
    </Stack.Navigator>
  );
}
