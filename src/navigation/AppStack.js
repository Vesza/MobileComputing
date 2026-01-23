// React wird für die Komponente benötigt.
// createNativeStackNavigator erstellt einen Stack-Navigator für die App-Navigation.
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens, die im App-Stack verfügbar sind.
// Welcome ist der Startscreen nach dem Login.
// Calendar zeigt die Terminliste.
// CreateTitle/CreateDate/CreateTime sind die Schritte zum Erstellen.
// Detail zeigt Detailansichten für Elemente.
// QuickActions ist ein Modal für schnelle Aktionen.
// Notifications zeigt die Liste der Notifications.
// Impressum ist die Impressumsseite.
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

// Stack-Instanz wird einmal erstellt und anschließend in AppStack verwendet.
const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
  screenOptions={{
    // contentStyle setzt den Hintergrund für alle Screens im Stack.
    // headerRight setzt global den Logout-Button rechts im Header.
    contentStyle: { backgroundColor: COLORS.background },
    headerRight: () => <HeaderLogoutButton />,
  }}
>

      {/* Startscreen nach erfolgreichem Login */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      {/* Terminübersicht, mit einer leichten Fade-Animation beim Öffnen */}
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ animation: "fade" }}
      />
   
      {/* Detailansicht ohne Standard-Header, weil die Detailseite den Header selbst steuert */}
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />

      {/* Create-Flow Screens für das Anlegen eines Eintrags */}
      <Stack.Screen name="CreateTitle" component={CreateTitleScreen} />
      <Stack.Screen name="CreateDate" component={CreateDateScreen} />
      <Stack.Screen name="CreateTime" component={CreateTimeScreen} />

      {/* Impressum: eigener Screen, Logout-Button wird hier entfernt, Header ist komplett ausgeblendet */}
      <Stack.Screen name="Impressum" component={ImpressumScreen} options={{title: "Impressum",headerRight: () => null, headerShown: false}}/>


  
      {/* QuickActions wird als Modal präsentiert, damit es sich wie ein Overlay anfühlt */}
      <Stack.Screen
        name="QuickActions"
        component={QuickActionsScreen}
        options={{ presentation: "modal", title: "Aktionen" }}
      />


      {/* Liste der Notifications */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
