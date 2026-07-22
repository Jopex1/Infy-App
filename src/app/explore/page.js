"use client";
import { useState } from "react";
import { X, Play } from "lucide-react";

const categories = [
  {
    title: "Nutrition",
    icon: "🥗",
    color: "bg-orange-50 border-orange-200",
    iconBg: "bg-orange-100",
    videos: [
      { title: "Infant Nutrition Guide", id: "SA_9qmMOR3U" },
      { title: "Baby Foods & Healthy Eating", id: "VVmMK4ZcPxY" },
    ],
  },
  {
    title: "Vaccination",
    icon: "💉",
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
    videos: [
      { title: "Childhood Vaccines Explained", id: "LRdoBofFcNs" },
      { title: "Why Vaccines Matter", id: "VVmMK4ZcPxY" },
    ],
  },
  {
    title: "Child Development",
    icon: "🧠",
    color: "bg-purple-50 border-purple-200",
    iconBg: "bg-purple-100",
    videos: [
      { title: "Child Development Stages", id: "3F4XH7ACWOY" },
      { title: "Early Childhood Learning", id: "JvmTlvBUhuQ" },
    ],
  },
  {
    title: "Newborn Care",
    icon: "👶",
    color: "bg-pink-50 border-pink-200",
    iconBg: "bg-pink-100",
    videos: [
      { title: "Newborn Baby Essentials", id: "JvmTlvBUhuQ" },
      { title: "First Days With Your Baby", id: "9RVvxFNhHdI" },
    ],
  },
  {
    title: "Health & Wellness",
    icon: "❤️",
    color: "bg-red-50 border-red-200",
    iconBg: "bg-red-100",
    videos: [
      { title: "Baby Health Tips", id: "Oe0hfVNfLAI" },
      { title: "Keeping Your Baby Healthy", id: "k-8IKJkFvQ8" },
    ],
  },
  {
    title: "Safety & First Aid",
    icon: "🩺",
    color: "bg-teal-50 border-teal-200",
    iconBg: "bg-teal-100",
    videos: [
      { title: "Baby Safety at Home", id: "3F4XH7ACWOY" },
      { title: "First Aid for Infants", id: "JvmTlvBUhuQ" },
    ],
  },
  {
    title: "Parenting",
    icon: "🏠",
    color: "bg-yellow-50 border-yellow-200",
    iconBg: "bg-yellow-100",
    videos: [
      { title: "Positive Parenting Tips", id: "ApXoWvfEYVU" },
      { title: "Building Strong Parent-Child Bond", id: "JvmTlvBUhuQ" },
    ],
  },
  {
    title: "Growth Milestones",
    icon: "📏",
    color: "bg-green-50 border-green-200",
    iconBg: "bg-green-100",
    videos: [
      { title: "Baby Growth Milestones", id: "3F4XH7ACWOY" },
      { title: "Tracking Your Baby's Progress", id: "Oe0hfVNfLAI" },
    ],
  },
  {
    title: "Sleep & Rest",
    icon: "🌙",
    color: "bg-indigo-50 border-indigo-200",
    iconBg: "bg-indigo-100",
    videos: [
      { title: "Healthy Sleep for Babies", id: "JvmTlvBUhuQ" },
      { title: "Baby Sleep Tips", id: "3F4XH7ACWOY" },
    ],
  },
  {
    title: "Hygiene & Care",
    icon: "🛁",
    color: "bg-sky-50 border-sky-200",
    iconBg: "bg-sky-100",
    videos: [
      { title: "Baby Bath & Hygiene Guide", id: "JvmTlvBUhuQ" },
      { title: "Skincare for Babies", id: "Oe0hfVNfLAI" },
    ],
  },
  {
    title: "Learning & Play",
    icon: "🎨",
    color: "bg-lime-50 border-lime-200",
    iconBg: "bg-lime-100",
    videos: [
      { title: "Play Activities for Babies", id: "Oe0hfVNfLAI" },
      { title: "Early Learning Through Play", id: "3F4XH7ACWOY" },
    ],
  },
  {
    title: "Special Needs & Support",
    icon: "🤝",
    color: "bg-rose-50 border-rose-200",
    iconBg: "bg-rose-100",
    videos: [
      { title: "Supporting Children with Special Needs", id: "3F4XH7ACWOY" },
      { title: "Inclusive Parenting", id: "ApXoWvfEYVU" },
    ],
  },
];

export default function ExplorePage() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="min-h-screen pt-4 pb-safe">
        <div className="px-4 grid grid-cols-2 gap-4">
          {categories.map((cat, i) => (
            <button key={i}
              onClick={() => setSelected(cat)}
              className={`${cat.color} border rounded-3xl p-5 flex flex-col items-center text-center gap-3 active:scale-95 transition shadow-sm`}>
              <div className={`${cat.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>
                {cat.icon}
              </div>
              <span className="text-sm font-bold text-gray-700 leading-tight">{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Video Drawer Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200" onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selected.icon}</span>
                <h2 className="text-lg font-black text-gray-800">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="bg-gray-100 rounded-full p-1.5 text-gray-500"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              {selected.videos.map((v, i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="bg-gray-50 px-4 py-2">
                    <p className="text-sm font-bold text-gray-700">{v.title}</p>
                  </div>
                  <div className="aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${v.id}?controls=1&rel=0&modestbranding=1`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
