import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/FirebaseConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(
    () => ({ user, authLoading, logout }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
