// React-Imports für Context und Hooks.
// Der Context wird genutzt, um Auth-Daten global verfügbar zu machen.
// useEffect reagiert auf Änderungen am Login-Status.
// useMemo sorgt dafür, dass das Context-Objekt stabil bleibt, wenn sich nichts geändert hat.
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Firebase Auth:
// onIdTokenChanged liefert Updates, sobald sich der eingeloggte User oder dessen Token ändert.
// signOut meldet ab.
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "../services/FirebaseConfig";

// AuthContext ist der zentrale Speicher für Auth-Zustand und Funktionen.
const AuthContext = createContext(null);

// AuthProvider umschließt die App und stellt den Auth-Zustand bereit.
// children ist der restliche App-Inhalt, der Zugriff auf den Context bekommen soll.
export function AuthProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);

  // Beim Start wird ein Listener auf Firebase Auth registriert.
  // Der Listener setzt user, emailVerified und beendet den Loading-Zustand.
  // unsub wird beim Unmount zurückgegeben, damit der Listener sauber entfernt wird.
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, (u) => {
      setUser(u || null);
      setEmailVerified(!!u?.emailVerified);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Logout-Funktion wird im Context bereitgestellt.
  // signOut sorgt dafür, dass Firebase den User abmeldet.
  const logout = async () => {
    await signOut(auth);
  };

  // value bündelt alle Werte und Funktionen, die über den Context verfügbar sein sollen.
  // useMemo verhindert unnötige Re-Renders, wenn die Inhalte gleich bleiben.
  const value = useMemo(
    () => ({ user, emailVerified, authLoading, logout }),
    [user, emailVerified, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth ist ein kleiner Helper-Hook, um den Context bequem zu nutzen.
// Wenn useAuth außerhalb des AuthProvider verwendet wird, wird ein Fehler geworfen.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
