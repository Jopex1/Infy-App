"use client";
import { ArrowLeft, User, Shield, Mail, Key, Download, Trash2, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ManageAccount() {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadData = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("Your data has been successfully downloaded.");
    }, 1500);
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col pb-safe animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white border-b px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4 text-[#027027] p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-gray-900 text-lg">Manage Account</h1>
      </header>

      <div className="p-4 space-y-4">
        
        {/* Account Details */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-[#027027] mb-4 flex items-center gap-2"><User size={18}/> Account Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Email Address</span>
                <span className="block text-sm text-gray-700 mt-0.5">infytest@example.com</span>
              </div>
              <button className="text-[#027027] text-sm font-bold bg-green-50 px-3 py-1.5 rounded-lg active:scale-95 transition">Change</button>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Phone Number</span>
                <span className="block text-sm text-gray-700 mt-0.5">+233 248 000 1422</span>
              </div>
              <button className="text-[#027027] text-sm font-bold bg-green-50 px-3 py-1.5 rounded-lg active:scale-95 transition">Change</button>
            </div>
          </div>
        </div>

        {/* Security & Data */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-[#027027] mb-4 flex items-center gap-2"><Shield size={18}/> Security & Data</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition text-left">
              <div className="bg-gray-100 p-2 rounded-full text-gray-600"><Key size={18}/></div>
              <div className="flex-1">
                <span className="block text-sm font-bold text-gray-800">Change Password</span>
                <span className="block text-xs text-gray-500">Update your account password</span>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition text-left">
              <div className="bg-gray-100 p-2 rounded-full text-gray-600"><Smartphone size={18}/></div>
              <div className="flex-1">
                <span className="block text-sm font-bold text-gray-800">Two-Factor Authentication</span>
                <span className="block text-xs text-gray-500">Secure your account with 2FA</span>
              </div>
            </button>
            <button onClick={handleDownloadData} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition text-left">
              <div className="bg-gray-100 p-2 rounded-full text-gray-600"><Download size={18}/></div>
              <div className="flex-1">
                <span className="block text-sm font-bold text-gray-800">Download My Data</span>
                <span className="block text-xs text-gray-500">{downloading ? "Preparing download..." : "Get a copy of your app data"}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-3xl p-5 shadow-sm border border-red-100 mt-8">
          <h2 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><Trash2 size={18}/> Danger Zone</h2>
          <p className="text-xs text-red-600 mb-4 leading-relaxed">
            Deleting your account is permanent. All your child profiles, growth history, and vaccination records will be erased immediately.
          </p>
          <button className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-sm active:scale-95 transition text-sm">
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}
