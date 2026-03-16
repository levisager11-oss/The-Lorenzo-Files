import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAF6VZbcA1Pumr3W7jkRXwCL8jIJtAM1TM",
    authDomain: "the-lorenzo-files.firebaseapp.com",
    projectId: "the-lorenzo-files",
    storageBucket: "the-lorenzo-files.firebasestorage.app",
    messagingSenderId: "518134782301",
    appId: "1:518134782301:web:7cf0f888acbc1743d370b4",
    measurementId: "G-Q9KXPVHHVC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
