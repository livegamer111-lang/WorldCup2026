import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQaxpekeYY6uOZRdLxUTxoSuOqm4hO-0A",
  authDomain: "world-cup-predictor-11dfb.firebaseapp.com",
  projectId: "world-cup-predictor-11dfb",
  storageBucket: "world-cup-predictor-11dfb.firebasestorage.app",
  messagingSenderId: "472233854050",
  appId: "1:472233854050:web:083936e558e99498e7fd3b",
  measurementId: "G-FR04TF7LWE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
