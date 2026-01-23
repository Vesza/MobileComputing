import React, { useEffect } from "react";
import { View } from "react-native";
import { useFonts } from "expo-font";

import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { attachNotificationListeners, initNotificationsAsync } from "./src/services/notify";

export default function App() {
  // load custom font
  const [fontsLoaded] = useFonts({
    Awesome: require("./assets/fonts/Awesome.ttf"),
  });

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

  // wait for fonts to load 
  if (!fontsLoaded) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
