// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth} from "firebase/auth";
//ToDo import { getReactNativePersistence } from "firebase/auth";
//ToDo import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
//import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpegSkNpNfMFpNxxuIvM03ApPqf0aj-jI",
  authDomain: "breather-56194.firebaseapp.com",
  projectId: "breather-56194",
  storageBucket: "breather-56194.firebasestorage.app",
  messagingSenderId: "447821373764",
  appId: "1:447821373764:web:7baf477ad3677b7a577711",
  measurementId: "G-BVN7KHM7F9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);
export const db = getFirestore(app);
//ToDo export const storage = getStorage(app);