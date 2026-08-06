"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, MapPin, Lock, Eye, EyeOff, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { normalizePhoneNumber } from "@/lib/phoneHelper";
import { auth, createUserWithEmailAndPassword, signInWithPopup, googleProvider } from "@/lib/firebase";

export default function SignUp() {
  const router = useRouter();
  const fileRef = useRef();
  const [avatar, setAvatar] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phone, setPhone] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", location: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) setAvatar(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    
    const phoneRes = normalizePhoneNumber(phone, "GH");
    if (!phoneRes.isValid) {
      setError(phoneRes.error);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      
      localStorage.setItem("infy_user", JSON.stringify({ 
        uid: user.uid,
        email: user.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: phoneRes.normalized,
        location: form.location,
        avatar 
      }));

      // Signup notification — only once per account
      const signupKey = `infy_signup_notif_${user.uid}`;
      if (!localStorage.getItem(signupKey)) {
        const existing = JSON.parse(localStorage.getItem("infy_notifications") || "[]");
        const notif = {
          id: `signup_${user.uid}`,
          title: `Welcome to Infy, ${form.firstName}!`,
          body: "Your account has been created. Start tracking your child's growth today.",
          time: new Date().toISOString(),
          unread: true,
          type: "signup"
        };
        localStorage.setItem("infy_notifications", JSON.stringify([notif, ...existing]));
        localStorage.setItem(signupKey, "1");
      }
      
      setSubmitted(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      localStorage.setItem("infy_user", JSON.stringify({ 
        uid: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        phone: '',
        location: '',
        avatar: user.photoURL 
      }));

      // Signup notification — only once per account
      const signupKey = `infy_signup_notif_${user.uid}`;
      if (!localStorage.getItem(signupKey)) {
        const existing = JSON.parse(localStorage.getItem("infy_notifications") || "[]");
        const notif = {
          id: `signup_${user.uid}`,
          title: `Welcome to Infy, ${user.displayName?.split(' ')[0] || 'there'}!`,
          body: "Your account has been created. Start tracking your child's growth today.",
          time: new Date().toISOString(),
          unread: true,
          type: "signup"
        };
        localStorage.setItem("infy_notifications", JSON.stringify([notif, ...existing]));
        localStorage.setItem(signupKey, "1");
      }
      
      router.push("/");
    } catch (error) {
      setError(error.message);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <Mail className="text-[#027027]" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Mail</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-[280px]">
          We&apos;ve sent a link to <span className="font-bold text-gray-800">{form.email}</span>
        </p>
        <a href="https://mail.google.com" target="_blank" rel="noreferrer"
          className="w-full max-w-[250px] flex items-center justify-center gap-2 bg-[#ea4335] text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-95 transition">
          <Mail size={18} /> Verify Gmail
        </a>
        <button onClick={() => router.push("/login")} className="mt-6 text-[#027027] font-bold text-sm hover:underline">
          Skip for now
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 max-w-md mx-auto z-50 bg-white flex flex-col overflow-hidden">
      <PageHeader title="Create Account" subtitle="Join Infy and start tracking" backHref="/onboarding" />

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-12 space-y-4">
        {/* Avatar */}
        <div className="flex justify-center mb-2 py-2">

          <button type="button" onClick={() => fileRef.current.click()} className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-[#027027] overflow-hidden flex items-center justify-center shadow-md">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="avatar" /> : <User size={40} className="text-gray-400" />}
            </div>
            <div className="absolute bottom-0 right-0 bg-[#027027] rounded-full p-1.5 border-2 border-white">
              <Camera size={14} className="text-white" />
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Row (Original style) */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">First Name</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <User size={16} className="text-[#027027] shrink-0" />
                <input required type="text" placeholder="Ama" value={form.firstName}
                  onChange={e => setForm({...form, firstName: e.target.value})}
                  className="bg-transparent outline-none text-sm w-full text-gray-800" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Last Name</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <User size={16} className="text-[#027027] shrink-0" />
                <input type="text" placeholder="Sarpong" value={form.lastName}
                  onChange={e => setForm({...form, lastName: e.target.value})}
                  className="bg-transparent outline-none text-sm w-full text-gray-800" />
              </div>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Phone</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 h-[46px] phone-input-wrapper w-full">
              <PhoneInput
                international
                defaultCountry="GH"
                value={phone}
                onChange={(val) => {
                  if (!val) { setPhone(""); return; }
                  setPhone(val);
                }}
                onBlur={() => {
                  if (phone) {
                    const fixed = phone.replace(/(\+\d+)0(\d)/, "$1$2");
                    setPhone(fixed);
                  }
                }}
                placeholder="241 234 567"
                className="w-full bg-transparent outline-none text-sm text-gray-800"
              />
            </div>
          </div>

          {/* Gmail */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Gmail</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Mail size={16} className="text-[#027027] shrink-0" />
              <input required type="text" placeholder="ama" value={form.email.replace("@gmail.com", "")}
                onChange={e => setForm({...form, email: e.target.value + "@gmail.com"})}
                className="bg-transparent outline-none text-sm w-full text-gray-800 placeholder-gray-400" />
              <span className="text-sm text-gray-400">@gmail.com</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Location</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <MapPin size={16} className="text-[#027027] shrink-0" />
              <input type="text" placeholder="Kumasi, Ghana" value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
                className="bg-transparent outline-none text-sm w-full text-gray-800 placeholder-gray-400" />
            </div>
          </div>

          {/* Password (Original style) */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Password</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Lock size={16} className="text-[#027027] shrink-0" />
              <input required type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="bg-transparent outline-none text-sm w-full text-gray-800" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400">
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {/* Confirm Password (Original style) */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Confirm Password</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Lock size={16} className="text-[#027027] shrink-0" />
              <input required type={showConfirm ? "text" : "password"} placeholder="Re-enter password" value={form.confirm}
                onChange={e => setForm({...form, confirm: e.target.value})}
                className="bg-transparent outline-none text-sm w-full text-gray-800" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400">
                {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

          <button type="submit"
            className="w-full bg-gradient-to-r from-[#027027] to-[#028e32] text-white font-bold py-3.5 rounded-2xl shadow-none active:scale-95 transition-all text-[15px] flex items-center justify-center gap-2 mt-2">
            Create Account
          </button>
          
          <button type="button" onClick={handleGoogleSignUp}
            className="w-full bg-white border border-[#027027] text-black font-normal py-3.5 rounded-2xl shadow-none active:scale-95 transition-all text-sm flex items-center justify-center gap-2 mt-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-400 mt-4 pb-4">
            Already have an account?{" "}
            <Link href="/login" className="text-[#027027] font-bold">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
