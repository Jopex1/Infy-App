"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const hashPassword = async (str) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
};

const SUPER_ADMIN_HASH = "1ae3fcff1a58694ed37d127f994d077e4d0a13673427eafeb66b55ad1534a5ce";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      if (isSuperAdminEmail && pwdHash === SUPER_ADMIN_HASH && (form.username === "superadmin" || form.username === "")) {
        sessionStorage.setItem("infy_admin_session", JSON.stringify({ role: "SUPER_ADMIN", username: "Super Admin" }));
        router.push("/infy/admin");
        return;
      }

      if (isSuperAdminEmail) {
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
    <div className="min-h-screen flex flex-col justify-center items-center p-4" style={{ background: "linear-gradient(135deg, #f0f7f0 0%, #e8f5e9 100%)" }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: "#027027", filter: "blur(80px)" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: "#027027", filter: "blur(80px)" }} />
      </div>

      <div className="max-w-md w-full rounded-3xl shadow-2xl p-8 border relative z-10" style={{ background: "white", borderColor: "#c8e6c9" }}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg" style={{ background: "#027027" }}>
            <div className="relative w-10 h-10">
              <Image src="/icons/infy_wordmark_mono_1.png" alt="Infy" fill className="object-contain brightness-0 invert" />
            </div>
          </div>
          <h1 className="text-2xl font-black" style={{ color: "#014d1a" }}>Admin Portal</h1>
          <p className="text-sm mt-1" style={{ color: "#4caf50" }}>Authorized personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="text-sm p-3 rounded-xl border text-center" style={{ background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }}>
              {error}
            </div>
          )}
          
          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: "#027027" }}>Email</label>
            <input 
              required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full rounded-xl px-4 py-3 outline-none text-sm transition border"
              style={{ background: "#f0f7f0", borderColor: "#c8e6c9", color: "#1a1a1a" }}
              onFocus={e => { e.target.style.borderColor = "#027027"; }}
              onBlur={e => { e.target.style.borderColor = "#c8e6c9"; }}
              placeholder="Admin Email" 
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: "#027027" }}>Username</label>
            <input 
              type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
              className="w-full rounded-xl px-4 py-3 outline-none text-sm transition border"
              style={{ background: "#f0f7f0", borderColor: "#c8e6c9", color: "#1a1a1a" }}
              onFocus={e => { e.target.style.borderColor = "#027027"; }}
              onBlur={e => { e.target.style.borderColor = "#c8e6c9"; }}
              placeholder="Leave blank for Super Admin" 
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: "#027027" }}>Password</label>
            <input 
              required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full rounded-xl px-4 py-3 outline-none text-sm transition border"
              style={{ background: "#f0f7f0", borderColor: "#c8e6c9", color: "#1a1a1a" }}
              onFocus={e => { e.target.style.borderColor = "#027027"; }}
              onBlur={e => { e.target.style.borderColor = "#c8e6c9"; }}
              placeholder="Enter password" 
            />
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full mt-4 text-white font-bold py-3.5 rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
            style={{ background: loading ? "#4caf50" : "#027027" }}
          >
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "#9e9e9e" }}>Infy Health Tracker · Admin Portal</p>
      </div>
    </div>
  );
}
