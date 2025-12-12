import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKyvq9A_R_NwKULlFgCfCORTrb53Hnfow",
  authDomain: "finanflow-ff0a8.firebaseapp.com",
  projectId: "finanflow-ff0a8",
  storageBucket: "finanflow-ff0a8.firebasestorage.app",
  messagingSenderId: "976373604916",
  appId: "1:976373604916:web:1ed1701f2e208e2dbd2061",
  measurementId: "G-6Y957JZ43M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);