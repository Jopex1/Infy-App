"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, signInWithPopup, googleProvider } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";

export default function Onboarding() {
  const [step, setStep] = useState(0); // 0 = animated logo splash, 1 = onboarding 1, 2 = onboarding 2
  const [userAuth, setUserAuth] = useState(null);
  const [bg2Loaded, setBg2Loaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUserAuth(u));
    return () => unsubscribe();
  }, []);

  // Step 0: animated logo → step 1 after 1.8s
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 1800);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Step 1: show onboarding 1 image for 5s then advance
  useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => {
        if (userAuth) router.push("/home");
        else setStep(2);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [step, userAuth, router]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem("infy_user", JSON.stringify({
        uid: user.uid,
        email: user.email,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        phone: "",
        location: "",
        avatar: user.photoURL,
      }));
      router.push("/home");
    } catch (error) {
      if (error.code !== "auth/cancelled-popup-request") {
        console.error("Google sign in error:", error);
      }
    }
  };

  // ── Step 0: Animated logo splash ────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div style={{ animation: "logoEntrance 1.4s ease forwards" }}>
          <img
            src="/images/infy-app-icon.png"
            alt="Infy"
            style={{ width: 120, height: 120, objectFit: "contain" }}
          />
        </div>
        <style>{`
          @keyframes logoEntrance {
            0%   { opacity: 0; transform: scale(0.5); }
            50%  { opacity: 1; transform: scale(1.08); }
            75%  { transform: scale(0.96); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ── Step 1: Onboarding image 1 ───────────────────────────────────────────────
  if (step === 1) {
    return (
      <div
        onClick={() => { if (userAuth) router.push("/home"); else setStep(2); }}
        className="fixed inset-0 bg-white z-50 cursor-pointer"
        style={{ animation: "fadeIn 0.4s ease" }}
      >
        <img
          src="/images/Onboarding 1.png"
          alt="Onboarding 1"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
      </div>
    );
  }

  // ── Step 2: Onboarding 2 — wait for bg image before showing content ──────────
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden">

      {/* Preload bg image silently; reveal everything together on load */}
      <img
        src="/images/Onboarding 2.jpg"
        alt="Onboarding 2"
        onLoad={() => setBg2Loaded(true)}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", zIndex: 0,
          opacity: bg2Loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Content — only visible once image is ready */}
      <div
        className="absolute inset-0 z-10 flex flex-col justify-between pt-20 pb-10 px-6"
        style={{
          opacity: bg2Loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* Top Text */}
        <div className="text-center pt-8">
          <h1 className="text-[28px] font-medium text-black mb-2 drop-shadow-md">
            Welcome to Infy
          </h1>
          <p className="text-[15px] leading-snug text-gray-800 max-w-[260px] mx-auto drop-shadow-sm font-medium">
            This app brings all your child care and welfare information{" "}
            <span className="text-[#027027] font-bold">together in one place.</span>
          </p>
        </div>

        {/* Bottom Buttons */}
        <div className="flex flex-col gap-3 w-full px-8">
          <div className="flex gap-3">
            <Link
              href="/login"
              className="flex-1 bg-[#f7e03c] text-black font-bold text-[15px] py-3 rounded-full shadow-md text-center active:scale-95 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="flex-1 bg-white text-[#027027] font-bold text-[15px] py-3 rounded-full shadow-md text-center active:scale-95 transition"
            >
              Sign Up
            </Link>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-gray-700 font-bold text-[15px] py-3 rounded-full shadow-md flex items-center justify-center gap-2 active:scale-95 transition border border-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

    </div>
  );
}
