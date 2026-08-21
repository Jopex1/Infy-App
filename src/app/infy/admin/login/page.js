"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
// Using a basic hashing function for the super admin password on client side (not deeply secure but fits requirement)
const hashPassword = async (str) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
};

// SHA-256 hash of "Decode"
const SUPER_ADMIN_HASH = "8e95079a40590895f9c9b4e1f7c1bb5538d35f42c1626f25db735be971eb0579";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect
  useEffect(() => {
    const adminSession = sessionStorage.getItem("infy_admin_session");
    if (adminSession) {
      router.replace("/infy/admin");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isSuperAdminEmail = form.email.toLowerCase() === "infysupport5@gmail.com";
      const pwdHash = await hashPassword(form.password);

      // Super Admin Check (Does not need username if we strictly want just password, but user said "User Name given by super admin" for OTHERS. 
      // For Super Admin, we'll allow empty username or check for 'superadmin').
      if (isSuperAdminEmail && pwdHash === SUPER_ADMIN_HASH && (form.username === "superadmin" || form.username === "")) {
        sessionStorage.setItem("infy_admin_session", JSON.stringify({ role: "SUPER_ADMIN", username: "Super Admin" }));
        router.push("/infy/admin");
        return;
      }

      // If not super admin credentials, check Firestore for sub-admins
      if (isSuperAdminEmail) {
        // They must use infysupport5@gmail.com, a specific username, and specific password
        const q = query(collection(db, "admins"), where("username", "==", form.username));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const adminDoc = snapshot.docs[0].data();
          if (adminDoc.passwordHash === pwdHash) {
            sessionStorage.setItem("infy_admin_session", JSON.stringify({ role: "ADMIN", username: adminDoc.username, id: snapshot.docs[0].id }));
            router.push("/infy/admin");
            return;
          }
        }
      }
      
      throw new Error("Invalid admin credentials.");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-10 mb-4">
            <Image src="/icons/infy_wordmark_mono_1.png" alt="Infy Logo" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Admin Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Authorized personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{error}</div>}
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Email</label>
            <input 
              required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#027027] text-sm text-gray-800 transition" 
              placeholder="Admin Email" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Username</label>
            <input 
              type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#027027] text-sm text-gray-800 transition" 
              placeholder="Leave blank for Super Admin" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Password</label>
            <input 
              required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#027027] text-sm text-gray-800 transition" 
              placeholder="Enter password" 
            />
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
