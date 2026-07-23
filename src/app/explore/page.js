"use client";
import { useState } from "react";
import { ChevronLeft, Play } from "lucide-react";

const categories = [
  {
    title: "Nutrition",
    icon: "🥗",
    color: "bg-orange-50 border-orange-200",
    iconBg: "bg-orange-100",
    videos: [
      { title: "Infant Nutrition Guide", id: "c7Yr3KNnujs" },
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
      { title: "Why Vaccines Matter", id: "kQWiSM-98MA" },
    ],
  },
  {
    title: "Child Development",
    icon: "🧠",
    color: "bg-purple-50 border-purple-200",
    iconBg: "bg-purple-100",
    videos: [
      { title: "Child Development Stages", id: "i3oAo0FSpn8" },
      { title: "Early Brain Development", id: "VVmMK4ZcPxY" },
    ],
  },
  {
    title: "Newborn Care",
    icon: "👶",
    color: "bg-pink-50 border-pink-200",
    iconBg: "bg-pink-100",
    videos: [
      { title: "Newborn Care Basics", id: "ne06nPIKTmE" },
      { title: "How to Swaddle a Baby", id: "2vqhTU16Dr4" },
    ],
  },
  {
    title: "Health & Wellness",
    icon: "❤️",
    color: "bg-red-50 border-red-200",
    iconBg: "bg-red-100",
    videos: [
      { title: "Signs Your Baby is Sick", id: "wW8yMh-77s4" },
      { title: "Pediatric Fever Tips", id: "D5Wnru8y_g0" },
    ],
  },
  {
    title: "Safety & First Aid",
    icon: "🩺",
    color: "bg-teal-50 border-teal-200",
    iconBg: "bg-teal-100",
    videos: [
      { title: "First Aid for Choking Infants", id: "0aV9G14uOQ0" },
      { title: "Babyproofing Your Home", id: "Yg20XU4yT5s" },
    ],
  },
  {
    title: "Parenting",
    icon: "🏠",
    color: "bg-yellow-50 border-yellow-200",
    iconBg: "bg-yellow-100",
    videos: [
      { title: "10 Essential Tips for New Parents", id: "9t88P3Z7k7k" },
      { title: "Positive Parenting Guide", id: "ApXoWvfEYVU" },
    ],
  },
  {
    title: "Growth Milestones",
    icon: "📏",
    color: "bg-green-50 border-green-200",
    iconBg: "bg-green-100",
    videos: [
      { title: "Baby Growth & Milestones Checklist", id: "7_2f4hKqDsw" },
      { title: "Tracking Baby Growth Stages", id: "v_eO4xWpT58" },
    ],
  },
  {
    title: "Sleep & Rest",
    icon: "🌙",
    color: "bg-indigo-50 border-indigo-200",
    iconBg: "bg-indigo-100",
    videos: [
      { title: "How to Get Baby to Sleep", id: "eB11Lw5e8nE" },
      { title: "Establishing a Newborn Bedtime Routine", id: "y2jV45P4E-E" },
    ],
  },
  {
    title: "Hygiene & Care",
    icon: "🛁",
    color: "bg-sky-50 border-sky-200",
    iconBg: "bg-sky-100",
    videos: [
      { title: "How to Bathe a Newborn Baby", id: "p5yC5o-Pq5k" },
      { title: "Trimming Baby Nails Safely", id: "Y1J9C75x24Q" },
    ],
  },
  {
    title: "Learning & Play",
    icon: "🎨",
    color: "bg-lime-50 border-lime-200",
    iconBg: "bg-lime-100",
    videos: [
      { title: "Developmental Play Activities for Babies", id: "1uMv1Hk6tZk" },
      { title: "Sensory Play Ideas for Babies", id: "2nN4jS8yQ8E" },
    ],
  },
  {
    title: "Special Needs & Support",
    icon: "🤝",
    color: "bg-rose-50 border-rose-200",
    iconBg: "bg-rose-100",
    videos: [
      { title: "Early Warning Signs of Developmental Delay", id: "7_2f4hKqDsw" },
      { title: "Inclusive Parenting Support", id: "wF9kO_k47Lw" },
    ],
  },
];

export default function ExplorePage() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen pt-4 pb-safe">
      {!selected ? (
        <div className="px-4 grid grid-cols-2 gap-4 animate-in fade-in duration-300">
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
      ) : (
        <div className="flex flex-col animate-in slide-in-from-right-8 fade-in duration-300 h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 pb-4 border-b border-gray-100 bg-background sticky top-[calc(4.5rem+env(safe-area-inset-top,0px))] z-10 -mt-4 pt-4">
            <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition">
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className={`${selected.iconBg} w-8 h-8 rounded-lg flex items-center justify-center text-lg`}>{selected.icon}</div>
              <h2 className="text-lg font-bold text-gray-800">{selected.title}</h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-6">
            {selected.videos.map((v, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <div className="p-4 pb-3">
                  <h3 className="font-bold text-gray-800 leading-tight">{v.title}</h3>
                </div>
                <div className="aspect-video w-full relative bg-gray-900">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}?controls=1&rel=0&modestbranding=1&showinfo=0&fs=0`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    className="w-full h-full absolute inset-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
