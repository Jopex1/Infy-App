"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { normalizePhoneNumber } from "@/lib/phoneHelper";
import { auth, signInWithEmailAndPassword, signInWithPopup, googleProvider } from "@/lib/firebase";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState("email"); // "email" or "phone"
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.identifier, form.password);
      const user = userCredential.user;
      
      // Login notification — only fires after a real login (not existing session)
      const existing = JSON.parse(localStorage.getItem("infy_notifications") || "[]");
      const loginNotif = {
        id: `login_${Date.now()}`,
        title: "Sign In Successful",
        body: `You signed in with ${user.email}. Welcome back!`,
        time: new Date().toISOString(),
        unread: true,
        type: "login"
      };
      localStorage.setItem("infy_notifications", JSON.stringify([loginNotif, ...existing]));

      localStorage.setItem("infy_user", JSON.stringify({ 
        uid: user.uid,
        email: user.email
      }));
      
      router.push("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Login notification — fires after real login
      const existing = JSON.parse(localStorage.getItem("infy_notifications") || "[]");
      const loginNotif = {
        id: `login_${Date.now()}`,
        title: "Sign In Successful",
        body: `You signed in with Google as ${user.email}. Welcome back!`,
        time: new Date().toISOString(),
        unread: true,
        type: "login"
      };
      localStorage.setItem("infy_notifications", JSON.stringify([loginNotif, ...existing]));
      
      localStorage.setItem("infy_user", JSON.stringify({ 
        uid: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        phone: '',
        location: '',
        avatar: user.photoURL 
      }));
      
      router.push("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 max-w-md mx-auto z-50 bg-white flex flex-col overflow-hidden">
      <PageHeader title="Welcome Back" subtitle="Login to continue tracking" backHref="/onboarding" />

      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-10">
        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          <button onClick={() => setMode("email")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${mode === "email" ? "bg-white text-[#027027] shadow" : "text-gray-500"}`}>
            Gmail
          </button>
          <button onClick={() => setMode("phone")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${mode === "phone" ? "bg-white text-[#027027] shadow" : "text-gray-500"}`}>
            Phone Number
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
              {mode === "email" ? "Gmail" : "Phone Number"}
            </label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5">
              {mode === "email"
                ? <Mail size={16} className="text-[#027027] shrink-0"/>
                : <Phone size={16} className="text-[#027027] shrink-0"/>}
              {mode === "email" ? (
                <>
                  <input required
                    type="text"
                    placeholder="ama"
                    value={form.identifier.replace("@gmail.com", "")}
                    onChange={e => setForm({...form, identifier: e.target.value + "@gmail.com"})}
                    className="bg-transparent outline-none text-sm w-full text-left text-gray-800" />
                  <span className="text-sm text-gray-800 ml-1">@gmail.com</span>
                </>
              ) : (
                <input required
                  type="tel"
                  placeholder="+233 248 000 0000"
                  value={form.identifier}
                  onChange={e => setForm({...form, identifier: e.target.value})}
                  className="bg-transparent outline-none text-sm w-full text-gray-800" />
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Password</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5">
              <Lock size={16} className="text-[#027027] shrink-0"/>
              <input required
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="bg-transparent outline-none text-sm w-full text-gray-800" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400">
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit"
            className="w-full border border-[#027027] text-[#027027] font-bold py-3.5 rounded-2xl bg-transparent active:scale-95 transition-all text-[15px] flex items-center justify-center gap-2 mt-2">
            Login
          </button>

          <div className="relative flex items-center my-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-3 text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button type="button" onClick={handleGoogleLogin}
            className="w-full bg-white border border-[#027027] text-black font-normal text-sm py-3.5 rounded-2xl shadow-none flex items-center justify-center gap-3 active:scale-95 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 pb-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#027027] font-bold">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

