import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminAuth = null;

function cleanEnvValue(value) {
  if (!value) return "";
  return value.trim().replace(/^(['"])(.*)\1$/s, "$2");
}

function getServiceAccount() {
  const serviceAccountJson = cleanEnvValue(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    if (serviceAccount.private_key) serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    return serviceAccount;
  }

  const clientEmail = cleanEnvValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = cleanEnvValue(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  if (!clientEmail || !privateKey) return null;

  return {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.project_id || "infy-app-8119a",
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim(),
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
