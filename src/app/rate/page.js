"use client";
import { ArrowLeft, Star } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RatePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="bg-white border-b px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4 text-[#027027] p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-gray-900 text-lg">Rate Us</h1>
      </header>
      
      <div className="p-6 flex flex-col gap-6 items-center mt-10">
        <div className="flex gap-2 text-yellow-400 mb-2">
          <Star size={48} fill="currentColor" />
          <Star size={48} fill="currentColor" />
          <Star size={48} fill="currentColor" />
          <Star size={48} fill="currentColor" />
          <Star size={48} fill="currentColor" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-800 mb-3">Enjoying Infy?</h2>
          <p className="text-gray-600 leading-relaxed text-sm mb-8 px-4">
            We'd love your feedback! Please leave a review on the app store to help other parents find us.
          </p>
        </div>

        <button className="w-full bg-[#027027] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-800 active:scale-95 transition text-sm flex items-center justify-center gap-2">
          <Star size={18} fill="currentColor" /> Submit Review
        </button>
        
        <button onClick={() => router.back()} className="text-gray-500 font-medium text-sm mt-4 hover:text-gray-800">
          Not now
        </button>
      </div>
    </div>
  );
}
