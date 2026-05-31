// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQaxpekeYY6uOZRdLxUTxoSuOqm4hO-0A",
  authDomain: "world-cup-predictor-11dfb.firebaseapp.com",
  projectId: "world-cup-predictor-11dfb",
  storageBucket: "world-cup-predictor-11dfb.firebasestorage.app",
  messagingSenderId: "472233854050",
  appId: "1:472233854050:web:083936e558e99498e7fd3b",
  measurementId: "G-FR04TF7LWE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
