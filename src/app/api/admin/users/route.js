import { getAdminAuth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const adminAuth = getAdminAuth();
    const listResult = await adminAuth.listUsers(1000);
    const users = listResult.users.map(u => ({
      uid: u.uid,
      email: u.email || "",
      displayName: u.displayName || "",
      photoURL: u.photoURL || "",
      createdAt: u.metadata.creationTime,
      lastSignIn: u.metadata.lastSignInTime,
      provider: u.providerData?.[0]?.providerId || "unknown",
    }));
    return NextResponse.json({ users, total: users.length });
  } catch (err) {
    console.error("Admin list users error:", {
      message: err.message,
      hasProjectId: Boolean(process.env.FIREBASE_ADMIN_PROJECT_ID),
      hasClientEmail: Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
      hasPrivateKey: Boolean(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
      hasServiceAccountJson: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
    });
    return NextResponse.json({ error: `Unable to load users: ${err.message}` }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: "UID required" }, { status: 400 });
    const adminAuth = getAdminAuth();
    await adminAuth.deleteUser(uid);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin delete user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
