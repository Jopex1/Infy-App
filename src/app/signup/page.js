"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, MapPin, Lock, Eye, EyeOff, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    localStorage.setItem("infy_user", JSON.stringify({ ...form, phone, avatar }));
    setSubmitted(true);
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
    <div className="min-h-screen bg-white pb-12">
      <PageHeader title="Create Account" subtitle="Join Infy and start tracking" backHref="/onboarding" />

      <div className="px-6 pt-5 space-y-4">
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

          {/* Right-aligned block for Phone, Gmail, Location */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4">
            
            {/* Phone */}
            <div className="flex items-center justify-between py-3.5 border-b border-gray-100 relative">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide w-24">Phone</span>
              <div className="flex items-center flex-1 justify-start phone-input-wrapper-no-border">
                <PhoneInput
                  international
                  defaultCountry="GH"
                  value={phone}
                  onChange={(val) => {
                    if (!val) { setPhone(""); return; }
                    // Strip leading 0 after country code
                    setPhone(val);
                  }}
                  onBlur={() => {
                    // e.g. if user typed 0241234567 with GH, fix to +233241234567
                    if (phone) {
                      const fixed = phone.replace(/(\+\d+)0(\d)/, "$1$2");
                      setPhone(fixed);
                    }
                  }}
                  placeholder="241 234 567"
                  className="w-full justify-start"
                />
              </div>
            </div>

            {/* Gmail */}
            <div className="flex items-center justify-between py-3.5 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide w-24">Gmail</span>
              <div className="flex flex-1 items-center justify-end">
                <input required type="text" placeholder="ama" value={form.email.replace("@gmail.com", "")}
                  onChange={e => setForm({...form, email: e.target.value + "@gmail.com"})}
                  className="text-right outline-none text-sm text-gray-800 bg-transparent placeholder-gray-400 w-full" />
                <span className="text-sm text-gray-800 ml-1">@gmail.com</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide w-24">Location</span>
              <input type="text" placeholder="Kumasi, Ghana" value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
                className="text-right flex-1 outline-none text-sm text-gray-800 bg-transparent placeholder-gray-400" />
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
            className="w-full bg-gradient-to-r from-[#027027] to-[#028e32] text-white font-bold py-3.5 rounded-2xl shadow-[0_8px_20px_-6px_rgba(2,112,39,0.5)] active:scale-95 transition-all text-[15px] flex items-center justify-center gap-2 mt-2">
            Create Account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-80">
              <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
