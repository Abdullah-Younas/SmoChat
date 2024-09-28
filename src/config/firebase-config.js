// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider} from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1fyLax2uWgDnzCBt93KqjDj09EULZuGI",
  authDomain: "smochat-ea815.firebaseapp.com",
  projectId: "smochat-ea815",
  storageBucket: "smochat-ea815.appspot.com",
  messagingSenderId: "202886426955",
  appId: "1:202886426955:web:e4a6b7b66ea50edb8778ce",
  measurementId: "G-SJFJL0T12D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const GoogleAuth = new GoogleAuthProvider();
export const db = getFirestore(app);