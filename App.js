import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/services/FirebaseConfig";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import VerifyScreen from "./src/screens/VerifyScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";

import CreateTitleScreen from "./src/screens/CreateTitleScreen";
import CreateDateScreen from "./src/screens/CreateDateScreen";
import CreateTimeScreen from "./src/screens/CreateTimeScreen";
import CreateSuccessScreen from "./src/screens/CreateSuccessScreen";
import CalendarScreen from "./src/screens/CalendarScreen";

export default function App() {
  // Auth persistence state
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  // UI state
  const [screen, setScreen] = useState("login");
  const [verifyEmail, setVerifyEmail] = useState("");

  // Termin-Draft
  const [draft, setDraft] = useState({
    title: "",
    date: "",
    time: "",
  });

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setAuthLoading(false);

      // Auto-route based on session
      if (u) {
        // If user is logged in, skip login screen
        setScreen((prev) => (prev === "login" || prev === "register" || prev === "verify" ? "welcome" : prev));
      } else {
        // If user is logged out, force them to login
        setScreen("login");
      }
    });

    return unsub;
  }, []);

  // While Firebase restores session, show a simple loading screen
  if (authLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading session...</Text>
      </View>
    );
  }

  return (
    <>
      {screen === "login" && (
        <LoginScreen
          goToRegister={() => setScreen("register")}
          goToVerify={(email) => {
            setVerifyEmail(email);
            setScreen("verify");
          }}
          goToWelcome={() => setScreen("welcome")}
        />
      )}

      {screen === "register" && (
        <RegisterScreen
          goToLogin={() => setScreen("login")}
          goToVerify={(email) => {
            setVerifyEmail(email);
            setScreen("verify");
          }}
        />
      )}

      {screen === "verify" && (
        <VerifyScreen email={verifyEmail} goToLogin={() => setScreen("login")} />
      )}

      {screen === "welcome" && (
        <WelcomeScreen
          goToLogin={() => setScreen("login")}
          goToCreate={() => {
            setDraft({ title: "", date: "", time: "" });
            setScreen("create_title");
          }}
          goToCalendar={() => setScreen("calendar")}
        />
      )}

      {screen === "create_title" && (
        <CreateTitleScreen
          value={draft.title}
          setValue={(title) => setDraft((d) => ({ ...d, title }))}
          goBack={() => setScreen("welcome")}
          goHome={() => setScreen("welcome")}
          goNext={() => setScreen("create_date")}
        />
      )}

      {screen === "create_date" && (
        <CreateDateScreen
          value={draft.date}
          setValue={(date) => setDraft((d) => ({ ...d, date }))}
          goBack={() => setScreen("create_title")}
          goHome={() => setScreen("welcome")}
          goNext={() => setScreen("create_time")}
        />
      )}

      {screen === "create_time" && (
        <CreateTimeScreen
          title={draft.title}
          date={draft.date}
          value={draft.time}
          setValue={(time) => setDraft((d) => ({ ...d, time }))}
          goBack={() => setScreen("create_date")}
          goHome={() => setScreen("welcome")}
          goNext={() => setScreen("create_success")}
        />
      )}

      {screen === "create_success" && (
        <CreateSuccessScreen
          title={draft.title}
          date={draft.date}
          time={draft.time}
          goHome={() => setScreen("welcome")}
        />
      )}

      {screen === "calendar" && (
        <CalendarScreen
          goBack={() => setScreen("welcome")}
          goHome={() => setScreen("welcome")}
        />
      )}
    </>
  );
}
