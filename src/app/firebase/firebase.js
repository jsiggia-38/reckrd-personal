// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7FZFpaSV8w-fZjAMc02pzZG3RfsSeCzw",
  authDomain: "reckrd-c4481.firebaseapp.com",
  projectId: "reckrd-c4481",
  storageBucket: "reckrd-c4481.appspot.com",
  messagingSenderId: "514520435999",
  appId: "1:514520435999:web:8fdf4b15e591e4fce6342a",
  measurementId: "G-3RXWJ5T2MG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app)

export { app, auth }