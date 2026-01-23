// Firebase Core: App-Initialisierung und Zugriff auf bereits existierende App-Instanzen.
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

// Firestore: Datenbank-Instanz für Reads/Writes in Collections und Sub-Collections.
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase Auth: Auth-Instanz mit React-Native-Persistenz über AsyncStorage.
import {
  initializeAuth,
  getReactNativePersistence,
  Auth,
} from "firebase/auth";

// AsyncStorage wird als Storage-Layer genutzt, damit Login-Sessions auf dem Gerät erhalten bleiben.
import AsyncStorage from "@react-native-async-storage/async-storage";

// Konfiguration wird aus Expo-Environment-Variablen gelesen.
// Die Werte kommen typischerweise aus app config und werden beim Build gesetzt.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// Es wird genau eine Firebase App-Instanz verwendet.
// Wenn bereits eine existiert, wird sie wiederverwendet, sonst wird neu initialisiert.
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth soll nur einmal initialisiert werden.
// Bei Fast Refresh kann der Code erneut ausgeführt werden, deshalb wird ein Singleton verwendet.
let _auth: Auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e: any) {
  // initializeAuth wirft einen Fehler, wenn es innerhalb derselben App-Instanz doppelt aufgerufen wird.
  // In dem Fall greifen wir auf die bestehende Auth-Instanz zurück, die Expo/Firebase bereits hält.
  _auth = (app as any)._auth;
}

// Export der Instanzen, damit sie in der gesamten App zentral genutzt werden.
export const auth: Auth = _auth;
export const db: Firestore = getFirestore(app);
export { app };
