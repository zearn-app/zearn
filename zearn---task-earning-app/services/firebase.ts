
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDxTe-YKJijJJsb1s1j7TrMF_X3wksBu00",
  authDomain: "zearn-app.firebaseapp.com",
  projectId: "zearn-app",
  storageBucket: "zearn-app.firebasestorage.app",
  messagingSenderId: "212045636123",
  appId: "1:212045636123:web:50ecc3d866cfbebf050ebe",
  measurementId: "G-9JV3ZQVYSE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Auth exports
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const createRecaptcha = (containerId = 'recaptcha-container') => {
  try {
    // If already exists, reuse
    // @ts-ignore
    if (window.recaptchaVerifier) return window.recaptchaVerifier;
  } catch {}

  // Cast to any to satisfy varying firebase typings across versions
  const verifier = new RecaptchaVerifier(containerId as any, { size: 'invisible' } as any, auth as any);
  // @ts-ignore
  window.recaptchaVerifier = verifier;
  return verifier;
};

export const sendPhoneOtp = (phoneNumber: string) => {
  const verifier = createRecaptcha();
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
};

// Initialize Analytics conditionally
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(console.error);

export { analytics };
