import React, { useEffect } from "react";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { attachNotificationListeners, initNotificationsAsync } from "./src/services/notify";

export default function App() {
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

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
