// React wird für die App-Komponente benötigt, useEffect für Code, der beim Start einmal laufen soll.
// View wird als einfacher Platzhalter gerendert, solange Fonts noch nicht geladen sind.
// useFonts lädt eine lokale Schriftart aus dem assets-Ordner.
import React, { useEffect } from "react";
import { View } from "react-native";
import { useFonts } from "expo-font";

// AuthProvider stellt den Login-Status global zur Verfügung.
// RootNavigator entscheidet anhand des Login-Status, welche Screens angezeigt werden.
// initNotificationsAsync richtet Notification-Berechtigungen/Channels ein, attachNotificationListeners hängt Listener an.
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { attachNotificationListeners, initNotificationsAsync } from "./src/services/notify";

export default function App() {
  // Lädt die Custom-Font "Awesome" und liefert zurück, ob das Laden abgeschlossen ist.
  // Solange fontsLoaded false ist, wird die App-UI noch nicht gerendert.
  const [fontsLoaded] = useFonts({
    Awesome: require("./assets/fonts/Awesome.ttf"),
  });

  // Beim ersten Rendern (leeres Dependency-Array) werden Notifications initialisiert.
  // Wenn das erfolgreich ist, werden Listener registriert, damit beim Empfang/Reagieren Aktionen ausgelöst werden können.
  // detach speichert die Cleanup-Funktion, um Listener beim Unmount wieder zu entfernen.
  useEffect(() => {
    let detach = null;

    const run = async () => {
      const ok = await initNotificationsAsync();
      if (ok) {
        detach = attachNotificationListeners();
      }
    };

    run();

    return () => {
      if (detach) detach();
    };
  }, []);

  // Solange die Schriftart noch nicht geladen ist, wird ein leerer View gerendert.
  // Dadurch werden Layout-Probleme vermieden, die durch späteres Nachladen der Fonts entstehen können.
  if (!fontsLoaded) {
    return <View style={{ flex: 1 }} />;
  }

  // Sobald alles bereit ist, wird die App unter dem AuthProvider gerendert.
  // RootNavigator übernimmt dann die Navigation (z.B. AuthStack oder AppStack).
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
