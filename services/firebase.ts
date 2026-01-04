
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA9de7WGyCBlJqTvgFSV9eIqWEfGyToCmM",
  authDomain: "ytapp-ae423.firebaseapp.com",
  databaseURL: "https://ytapp-ae423-default-rtdb.firebaseio.com",
  projectId: "ytapp-ae423",
  storageBucket: "ytapp-ae423.firebasestorage.app",
  messagingSenderId: "305123776208",
  appId: "1:305123776208:web:fb3038b56d97602cf730d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

export default app;
