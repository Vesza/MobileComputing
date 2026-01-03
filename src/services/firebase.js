import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpegSkNpNfMFpNxxuIvM03ApPqf0aj-jI",
  authDomain: "breather-56194.firebaseapp.com",
  projectId: "breather-56194",
  storageBucket: "breather-56194.firebasestorage.app",
  messagingSenderId: "447821373764",
  appId: "1:447821373764:web:7baf477ad3677b7a577711",
  measurementId: "G-BVN7KHM7F9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
