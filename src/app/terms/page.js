"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsAndConditions() {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col pb-safe animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white border-b px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4 text-[#027027] p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-gray-900 text-lg">Terms & Conditions</h1>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5 text-sm text-gray-600 leading-relaxed">
          <h2 className="text-[#027027] font-bold text-lg mb-2">Welcome to Infy</h2>
          <p>
            By accessing or using the Infy Baby Tracker application, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
          </p>

          <h3 className="font-bold text-gray-800 text-base mt-4">1. Use of the App</h3>
          <p>
            Infy is designed to help parents and guardians track child growth, vaccinations, and milestones. The information provided by the app is for organizational and informational purposes only and does not substitute for professional medical advice.
          </p>

          <h3 className="font-bold text-gray-800 text-base mt-4">2. Medical Disclaimer</h3>
          <p>
            You acknowledge that any health data, vaccination schedules, or growth stages presented in the app are generic guidelines. Always consult a qualified pediatrician or healthcare provider regarding your child's specific health and developmental needs.
          </p>

          <h3 className="font-bold text-gray-800 text-base mt-4">3. Data Privacy</h3>
          <p>
            Your privacy is important to us. All child data and personal information you enter into the app is stored locally on your device unless explicitly synced to our secure cloud servers. We do not sell your personal data to third parties.
          </p>

          <h3 className="font-bold text-gray-800 text-base mt-4">4. User Responsibilities</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You agree to use the app in compliance with all applicable laws and regulations.
          </p>

          <h3 className="font-bold text-gray-800 text-base mt-4">5. Modifications</h3>
          <p>
            We reserve the right to modify these Terms at any time. Continued use of the app after changes indicates your acceptance of the updated terms.
          </p>

          <p className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
            Last Updated: July 2026
          </p>
        </div>
      </div>
    </div>
  );
}
