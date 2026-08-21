import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert({
        projectId: "infy-app-8119a",
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  : getApps()[0];

export const adminAuth = getAuth(adminApp);
