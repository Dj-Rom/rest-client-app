import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDPnoNYJ95g54IE8Dmt3YtKXx3pfB5B4i4",
  authDomain: "rest-client-app-e010a.firebaseapp.com",
  projectId: "rest-client-app-e010a",
  storageBucket: "rest-client-app-e010a.appspot.com",
  messagingSenderId: "797035696388",
  appId: "1:797035696388:web:f8451161f4e8bed8794051",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
