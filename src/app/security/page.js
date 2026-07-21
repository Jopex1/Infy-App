"use client";
import { ArrowLeft, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SecurityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="bg-white border-b px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4 text-[#027027] p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-gray-900 text-lg">Security</h1>
      </header>
      
      <div className="p-6 flex flex-col gap-6">
        <div className="flex justify-center my-4">
          <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center">
            <Lock size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Account Security</h2>
          <p className="text-gray-600 leading-relaxed text-sm mb-4">
            Your account is protected with email verification. For additional security, ensure your password is unique and at least 8 characters long.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <button className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl shadow-sm hover:bg-gray-200 active:scale-95 transition text-sm">
              Change Password
            </button>
            <button className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl shadow-sm hover:bg-gray-200 active:scale-95 transition text-sm">
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
