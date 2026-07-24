"use client";
import { useState } from "react";
import { ChevronLeft, Play, MoreVertical, Eye, Heart, Share2, MessageCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  {
    title: "Nutrition",
    icon: "🥗",
    color: "bg-orange-50 border-orange-200",
    iconBg: "bg-orange-100",
    videos: [
      { title: "Starting Solids: A Guide for Parents", description: "Complete guide to feeding your baby", id: "c7Yr3KNnujs", views: "125K", likes: "3.2K", duration: "24:00" },
      { title: "Baby Food Recipes", description: "Healthy meal ideas for babies", id: "VVmMK4ZcPxY", views: "89K", likes: "2.1K", duration: "18:30" },
    ],
  },
  {
    title: "Vaccination",
    icon: "💉",
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
    videos: [
      { title: "Vaccine Schedule Explained", description: "Understanding vaccine schedules", id: "LRdoBofFcNs", views: "210K", likes: "5.4K", duration: "15:45" },
      { title: "Importance of Childhood Vaccines", description: "Importance of immunization", id: "kQWiSM-98MA", views: "156K", likes: "4.1K", duration: "12:20" },
    ],
  },
  {
    title: "Child Development",
    icon: "🧠",
    color: "bg-purple-50 border-purple-200",
    iconBg: "bg-purple-100",
    videos: [
      { title: "Baby Development Milestones", description: "Milestones by age", id: "i3oAo0FSpn8", views: "340K", likes: "8.7K", duration: "28:15" },
      { title: "Brain Development in Early Childhood", description: "Brain growth in first years", id: "VVmMK4ZcPxY", views: "198K", likes: "5.2K", duration: "22:00" },
    ],
  },
  {
    title: "Newborn Care",
    icon: "👶",
    color: "bg-pink-50 border-pink-200",
    iconBg: "bg-pink-100",
    videos: [
      { title: "Newborn Baby Care Tips", description: "Essential care for new parents", id: "ne06nPIKTmE", views: "450K", likes: "12.3K", duration: "30:00" },
      { title: "How to Swaddle Your Baby", description: "Step-by-step swaddling guide", id: "2vqhTU16Dr4", views: "278K", likes: "7.8K", duration: "8:45" },
    ],
  },
  {
    title: "Health & Wellness",
    icon: "❤️",
    color: "bg-red-50 border-red-200",
    iconBg: "bg-red-100",
    videos: [
      { title: "When to Take Your Baby to the Doctor", description: "When to call the doctor", id: "wW8yMh-77s4", views: "167K", likes: "4.5K", duration: "14:30" },
      { title: "Managing Baby Fever", description: "Managing baby fever safely", id: "D5Wnru8y_g0", views: "134K", likes: "3.6K", duration: "11:15" },
    ],
  },
  {
    title: "Safety & First Aid",
    icon: "🩺",
    color: "bg-teal-50 border-teal-200",
    iconBg: "bg-teal-100",
    videos: [
      { title: "Infant CPR and Choking First Aid", description: "Life-saving techniques", id: "0aV9G14uOQ0", views: "512K", likes: "15.2K", duration: "10:00" },
      { title: "Babyproofing Your Home Guide", description: "Creating a safe environment", id: "Yg20XU4yT5s", views: "289K", likes: "8.1K", duration: "16:45" },
    ],
  },
  {
    title: "Parenting",
    icon: "🏠",
    color: "bg-yellow-50 border-yellow-200",
    iconBg: "bg-yellow-100",
    videos: [
      { title: "Tips for New Parents", description: "Survival guide for parents", id: "9t88P3Z7k7k", views: "678K", likes: "18.9K", duration: "25:30" },
      { title: "Positive Parenting Techniques", description: "Gentle parenting techniques", id: "ApXoWvfEYVU", views: "234K", likes: "6.7K", duration: "20:15" },
    ],
  },
  {
    title: "Growth Milestones",
    icon: "📏",
    color: "bg-green-50 border-green-200",
    iconBg: "bg-green-100",
    videos: [
      { title: "Baby Growth Milestones by Month", description: "Track your baby's progress", id: "7_2f4hKqDsw", views: "389K", likes: "10.4K", duration: "22:00" },
      { title: "Tracking Baby Development", description: "Monthly development guide", id: "v_eO4xWpT58", views: "156K", likes: "4.2K", duration: "18:30" },
    ],
  },
  {
    title: "Sleep & Rest",
    icon: "🌙",
    color: "bg-indigo-50 border-indigo-200",
    iconBg: "bg-indigo-100",
    videos: [
      { title: "Baby Sleep Training Methods", description: "Sleep training methods", id: "eB11Lw5e8nE", views: "890K", likes: "24.5K", duration: "35:00" },
      { title: "Newborn Bedtime Routine", description: "Creating healthy sleep habits", id: "y2jV45P4E-E", views: "412K", likes: "11.8K", duration: "19:45" },
    ],
  },
  {
    title: "Hygiene & Care",
    icon: "🛁",
    color: "bg-sky-50 border-sky-200",
    iconBg: "bg-sky-100",
    videos: [
      { title: "How to Give a Newborn a Bath", description: "Bath time safety tips", id: "p5yC5o-Pq5k", views: "345K", likes: "9.2K", duration: "12:30" },
      { title: "Trimming Baby Nails Safely", description: "Nail care for infants", id: "Y1J9C75x24Q", views: "123K", likes: "3.4K", duration: "7:15" },
    ],
  },
  {
    title: "Learning & Play",
    icon: "🎨",
    color: "bg-lime-50 border-lime-200",
    iconBg: "bg-lime-100",
    videos: [
      { title: "Baby Play Activities by Age", description: "Age-appropriate play ideas", id: "1uMv1Hk6tZk", views: "267K", likes: "7.3K", duration: "21:00" },
      { title: "Sensory Activities for Babies", description: "Stimulating activities", id: "2nN4jS8yQ8E", views: "189K", likes: "5.1K", duration: "16:30" },
    ],
  },
  {
    title: "Special Needs & Support",
    icon: "🤝",
    color: "bg-rose-50 border-rose-200",
    iconBg: "bg-rose-100",
    videos: [
      { title: "Developmental Delay Warning Signs", description: "What to watch for", id: "7_2f4hKqDsw", views: "145K", likes: "4.0K", duration: "17:45" },
      { title: "Parenting Children with Special Needs", description: "Resources for special needs", id: "wF9kO_k47Lw", views: "98K", likes: "2.8K", duration: "14:00" },
    ],
  },
];

export default function ExplorePage() {
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const router = useRouter();

  const handleAskInfyAI = (video) => {
    const videoLink = `https://www.youtube.com/watch?v=${video.id}`;
    localStorage.setItem("infy_ai_video", JSON.stringify({
      link: videoLink,
      title: video.title,
      description: video.description
    }));
    router.push("/chat");
  };

  const handleShare = async (video) => {
    const videoLink = `https://www.youtube.com/watch?v=${video.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: videoLink,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(videoLink);
      alert("Link copied to clipboard!");
    }
    setMenuOpen(null);
  };

  const handleWatchOnYouTube = (video) => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
    setMenuOpen(null);
  };

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
          <div className="p-4 space-y-4">
            {selected.videos.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-green-200 flex flex-col relative">
                {/* Video Thumbnail */}
                <div className="aspect-video w-full relative bg-gray-900">
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                    alt={v.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play size={24} className="text-green-600 fill-green-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {v.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 leading-tight flex-1 pr-2">{v.title}</h3>
                    <button 
                      onClick={() => setMenuOpen(menuOpen === i ? null : i)}
                      className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{v.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      <span>{v.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      <span>{v.likes}</span>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                {menuOpen === i && (
                  <div className="absolute top-20 right-4 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20 w-48 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => handleWatchOnYouTube(v)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                      <ExternalLink size={16} className="text-red-500" />
                      Watch on YouTube
                    </button>
                    <button
                      onClick={() => handleShare(v)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                      <Share2 size={16} className="text-blue-500" />
                      Share
                    </button>
                    <button
                      onClick={() => handleAskInfyAI(v)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                    >
                      <MessageCircle size={16} className="text-green-500" />
                      Ask Infy AI
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
