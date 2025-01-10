// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut} from 'firebase/auth';
import { getFirestore } from "@firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBO4LCiSinJGoOOFkdkg2uWGPhuT7QbcdY",
  authDomain: "chatfazz.firebaseapp.com",
  projectId: "chatfazz",
  storageBucket: "chatfazz.firebasestorage.app",
  messagingSenderId: "117782564631",
  appId: "1:117782564631:web:d311739e8592ba8ef8b152",
  measurementId: "G-NSRHD74PQQ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);

export {auth, GoogleAuthProvider, signInWithPopup, signOut, db, firebase}
export default app