// Firebase web SDK setup.
import { FirebaseOptions, FirebaseApp, getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Config values run in the browser (auth is client-side), so they MUST be
// prefixed with NEXT_PUBLIC_ — Next.js only inlines NEXT_PUBLIC_* env vars into
// the client bundle; anything else becomes an empty string.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let authInstance: Auth | undefined;

// Lazily initialize Firebase. This is only called from the browser (in auth
// event handlers), so it never runs during SSR/prerender — which keeps a
// missing/unset config from crashing the build, and avoids spinning up the
// auth SDK on the server where it isn't used.
export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }
  return authInstance;
}
