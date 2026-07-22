"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const sections = [
  {
    title: "1. About This Privacy Notice",
    content: "This Privacy Policy explains how Infy ('we', 'our', or 'us') collects, uses, stores, and protects your personal information when you use the Infy Baby Tracker application. By using Infy, you agree to the practices described in this notice. We are committed to protecting your privacy and being transparent about how your data is handled.",
  },
  {
    title: "2. Who We Are",
    content: "Infy is a child health tracking application developed to help parents monitor their children's growth, vaccination schedules, and development milestones. Infy is intended for use by parents and guardians of children aged 0–3 years. If you have any questions about this policy, you may contact us via the Help & Support section of the app.",
  },
  {
    title: "3. Information We Collect",
    content: "We may collect the following types of information:\n• Account Information: Name, email address, phone number, and location.\n• Child Information: Child's name, date of birth, gender, weight, height, and place of birth.\n• Health Records: Vaccination dates, weighing records, and growth milestones.\n• Usage Data: How you interact with the app, including pages visited and features used.\n• Device Information: Device type, operating system version, and app version.",
  },
  {
    title: "4. How We Use Your Information",
    content: "We use the information we collect to:\n• Provide and maintain the Infy app and its features.\n• Track your child's health, growth, and vaccination schedule.\n• Send reminders and notifications about upcoming milestones.\n• Improve the app's features and user experience.\n• Respond to your support requests.\n• Comply with legal obligations.",
  },
  {
    title: "5. Children's Data",
    content: "Infy collects information about children at the direction of, and under the control of, their parents or legal guardians. We do not knowingly collect personal data directly from children. All child-related data is managed exclusively by the registered parent or guardian. If you believe a child's data has been submitted without appropriate parental consent, please contact us immediately.",
  },
  {
    title: "6. Cookies and Similar Technologies",
    content: "Infy may use local storage and session storage technologies to remember your preferences and session state. We do not use advertising cookies or third-party tracking cookies. All data stored locally remains on your device and is not shared without your consent.",
  },
  {
    title: "7. Sharing Your Information",
    content: "We do not sell, trade, or rent your personal information to third parties. We may share data only in the following limited circumstances:\n• With service providers who assist us in operating the app (e.g. cloud hosting), bound by confidentiality agreements.\n• If required by law, court order, or government authority.\n• To protect the rights, safety, or property of Infy or its users.\nWe will never share your child's health data for advertising purposes.",
  },
  {
    title: "8. Data Storage and Security",
    content: "Your data is stored securely using industry-standard encryption. We implement technical and organisational measures to protect your information from unauthorised access, loss, or disclosure. While we take all reasonable precautions, no system is completely secure. If you suspect unauthorised access to your account, please contact us immediately.",
  },
  {
    title: "9. Data Retention",
    content: "We retain your account and child data for as long as your account is active. If you delete your account, your personal data will be permanently removed within 30 days. Anonymised usage analytics may be retained for longer periods to improve the app. You can request deletion of your data at any time through the app settings.",
  },
  {
    title: "10. Your Rights",
    content: "You have the right to:\n• Access the personal data we hold about you and your child.\n• Correct inaccurate or incomplete information.\n• Request deletion of your personal data.\n• Withdraw consent for data processing at any time.\n• Lodge a complaint with a relevant data protection authority.\nTo exercise any of these rights, please contact us through the Help & Support section.",
  },
  {
    title: "11. Third Party Services",
    content: "Infy may include links to third-party services (e.g. YouTube for educational videos). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before interacting with their content. YouTube videos embedded in the app are subject to Google's Privacy Policy.",
  },
  {
    title: "12. Updates to This Privacy Policy",
    content: "We may update this Privacy Policy from time to time to reflect changes in the law or our practices. When we make significant changes, we will notify you through the app or via email. The date of the latest revision is shown at the top of this page. Continued use of the app after changes are made constitutes your acceptance of the updated policy.",
  },
  {
    title: "13. Contact Us",
    content: "If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:\n\nInfy Baby Tracker Support\nEmail: support@infyapp.com\nHelp Centre: Available in the app via Menu → Help & Support\n\nLast updated: July 2026",
  },
];

function Section({ title, content }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-5 py-4 text-left font-bold text-gray-800 text-sm"
      >
        {title}
        {open ? <ChevronUp size={18} className="text-[#027027]" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-in fade-in duration-200 whitespace-pre-line">
          {content}
        </div>
      )}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-safe pt-4">
      <div className="p-4 space-y-3">
        {sections.map((s, i) => (
          <Section key={i} title={s.title} content={s.content} />
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 py-6">
        Last updated: July 2026
      </p>
    </div>
  );
}
