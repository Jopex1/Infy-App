import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminAuth = null;

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!clientEmail || !privateKey) return null;

  return {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.project_id || "infy-app-8119a",
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n").trim(),
  };
}

export function getAdminAuth() {
  if (adminAuth) return adminAuth;

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) throw new Error("Firebase Admin credentials are missing in the deployed environment.");

  const adminApp = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
  adminAuth = getAuth(adminApp);
  return adminAuth;
}

export { adminAuth };
