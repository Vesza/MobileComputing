import { useState } from "react";

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
  const [screen, setScreen] = useState("login");
  const [verifyEmail, setVerifyEmail] = useState("");

  // Termin-Draft (wird Schritt für Schritt gefüllt)
  const [draft, setDraft] = useState({
    title: "",
    date: "", // "TT.MM.JJJJ"
    time: "", // "HH:MM"
  });

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
            // Draft zurücksetzen
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
