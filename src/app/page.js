"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 250);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-20 w-20">
          <Image src="/icons/infy wordmark .png" alt="Infy logo" fill className="object-contain" priority />
        </div>
      </div>
    </div>
  );
}
