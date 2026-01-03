import { useState } from "react";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import VerifyScreen from "./src/screens/VerifyScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [verifyEmail, setVerifyEmail] = useState("");

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
        <VerifyScreen
          email={verifyEmail}
          goToLogin={() => setScreen("login")}
        />
      )}

      {screen === "welcome" && (
      <WelcomeScreen goToLogin={() => setScreen("login")} />
    )}
    </>
  );
}
