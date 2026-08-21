import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const hasAdminCredentials = !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL && !!process.env.FIREBASE_ADMIN_PRIVATE_KEY;

let adminApp = null;
let adminAuth = null;

if (hasAdminCredentials) {
  adminApp = !getApps().length
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || "infy-app-8119a",
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      })
    : getApps()[0];

  adminAuth = getAuth(adminApp);
}

export function getAdminAuth() {
  if (!adminAuth) {
    throw new Error("Firebase Admin is not configured. Add FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY.");
  }
  return adminAuth;
}

export { adminAuth };
