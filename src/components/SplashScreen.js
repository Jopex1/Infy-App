"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen({ children }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Analytics tracker
    const today = new Date().toISOString().split('T')[0];
    const visitedToday = localStorage.getItem("infy_visited_" + today);
    if (!visitedToday) {
      localStorage.setItem("infy_visited_" + today, "true");
      import("@/lib/firebase").then(({ db }) => {
        import("firebase/firestore").then(({ doc, setDoc, increment }) => {
          setDoc(doc(db, "analytics", today), { visitors: increment(1) }, { merge: true }).catch(console.error);
        });
      });
    }

    // Check if we already showed the splash in this session
    const hasShownSplash = sessionStorage.getItem("infy_splash_shown");
    
    if (hasShownSplash) {
      setShowSplash(false);
      return;
    }

    // Set timeout to hide splash and mark as shown
    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("infy_splash_shown", "true");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!showSplash) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f7f7f7]">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-1000">
          <div className="relative h-24 w-40 mb-2">
            <Image src="/icons/infy wordmark .png" alt="Infy Logo" fill className="object-contain" priority />
          </div>
        </div>
      </div>
      {/* Render children hidden initially to avoid flash of content if it takes time to render */}
      <div className="opacity-0 pointer-events-none fixed -z-50">{children}</div>
    </>
  );
}
