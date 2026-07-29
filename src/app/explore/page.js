"use client";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Play, MoreVertical, Share2, MessageCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  {
    title: "Nutrition",
    icon: "🥗",
    color: "bg-orange-50 border-orange-200",
    iconBg: "bg-orange-100",
    videos: [
      { id: "c7Yr3KNnujs" },
      { id: "SA_9qmMOR3U" },
    ],
  },
  {
    title: "Vaccination",
    icon: "💉",
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
    videos: [
      { id: "LRdoBofFcNs" },
      { id: "kQWiSM-98MA" },
    ],
  },
  {
    title: "Child Development",
    icon: "🧠",
    color: "bg-purple-50 border-purple-200",
    iconBg: "bg-purple-100",
    videos: [
      { id: "i3oAo0FSpn8" },
      { id: "VVmMK4ZcPxY" },
    ],
  },
  {
    title: "Newborn Care",
    icon: "👶",
    color: "bg-pink-50 border-pink-200",
    iconBg: "bg-pink-100",
    videos: [
      { id: "2vqhTU16Dr4" },
      { id: "JvmTlvBUhuQ" },
    ],
  },
  {
    title: "Health & Wellness",
    icon: "❤️",
    color: "bg-red-50 border-red-200",
    iconBg: "bg-red-100",
    videos: [
      { id: "9RVvxFNhHdI" },
      { id: "Oe0hfVNfLAI" },
    ],
  },
  {
    title: "Safety & First Aid",
    icon: "🩺",
    color: "bg-teal-50 border-teal-200",
    iconBg: "bg-teal-100",
    videos: [
      { id: "3F4XH7ACWOY" },
      { id: "wF9kO_k47Lw" },
    ],
  },
  {
    title: "Parenting",
    icon: "🏠",
    color: "bg-yellow-50 border-yellow-200",
    iconBg: "bg-yellow-100",
    videos: [
      { id: "7_2f4hKqDsw" },
      { id: "v_eO4xWpT58" },
    ],
  },
  {
    title: "Growth Milestones",
    icon: "📏",
    color: "bg-green-50 border-green-200",
    iconBg: "bg-green-100",
    videos: [
      { id: "i3oAo0FSpn8" },
      { id: "VVmMK4ZcPxY" },
    ],
  },
  {
    title: "Sleep & Rest",
    icon: "🌙",
    color: "bg-indigo-50 border-indigo-200",
    iconBg: "bg-indigo-100",
    videos: [
      { id: "eB11Lw5e8nE" },
      { id: "y2jV45P4E-E" },
    ],
  },
  {
    title: "Hygiene & Care",
    icon: "🛁",
    color: "bg-sky-50 border-sky-200",
    iconBg: "bg-sky-100",
    videos: [
      { id: "p5yC5o-Pq5k" },
      { id: "Y1J9C75x24Q" },
    ],
  },
  {
    title: "Learning & Play",
    icon: "🎨",
    color: "bg-lime-50 border-lime-100",
    iconBg: "bg-lime-100",
    videos: [
      { id: "1uMv1Hk6tZk" },
      { id: "2nN4jS8yQ8E" },
    ],
  },
  {
    title: "Special Needs & Support",
    icon: "🤝",
    color: "bg-rose-50 border-rose-200",
    iconBg: "bg-rose-100",
    videos: [
      { id: "wF9kO_k47Lw" },
      { id: "7_2f4hKqDsw" },
    ],
  },
];

export default function ExplorePage() {
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [videoTitles, setVideoTitles] = useState({});
  const router = useRouter();

  const allVideoIds = useMemo(
    () => [...new Set(categories.flatMap((cat) => cat.videos.map((v) => v.id)))],
    []
  );

  useEffect(() => {
    fetch("/api/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: allVideoIds }),
    })
      .then((res) => res.json())
      .then((data) => setVideoTitles(data.titles || {}))
      .catch(() => {});
  }, [allVideoIds]);

  const getTitle = (video) => videoTitles[video.id] || "Loading title…";

  const handleAskInfyAI = (video) => {
    const videoLink = `https://www.youtube.com/watch?v=${video.id}`;
    const title = getTitle(video);
    localStorage.setItem(
      "infy_ai_video",
      JSON.stringify({
        link: videoLink,
        title,
        description: `YouTube video: ${title}`,
      })
    );
    router.push("/chat");
  };

  const handleShare = async (video) => {
    const videoLink = `https://www.youtube.com/watch?v=${video.id}`;
    const title = getTitle(video);
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Watch: ${title}`,
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
    window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank");
    setMenuOpen(null);
  };

  return (
    <div className="min-h-screen pt-4 pb-safe">
      {!selected ? (
        <div className="px-4 grid grid-cols-2 gap-4 animate-in fade-in duration-300">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelected(cat)}
              className={`${cat.color} border rounded-3xl p-5 flex flex-col items-center text-center gap-3 active:scale-95 transition shadow-sm`}
            >
              <div className={`${cat.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>
                {cat.icon}
              </div>
              <span className="text-sm font-bold text-gray-700 leading-tight">{cat.title}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col animate-in slide-in-from-right-8 fade-in duration-300 h-full">
          <div className="flex items-center gap-3 px-4 pb-4 border-b border-gray-100 bg-background sticky top-[calc(4.5rem+env(safe-area-inset-top,0px))] z-10 -mt-4 pt-4">
            <button
              onClick={() => setSelected(null)}
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className={`${selected.iconBg} w-8 h-8 rounded-lg flex items-center justify-center text-lg`}>{selected.icon}</div>
              <h2 className="text-lg font-bold text-gray-800">{selected.title}</h2>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {selected.videos.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-green-200 flex flex-col relative">
                <div className="aspect-video w-full relative bg-gray-900">
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                    alt={getTitle(v)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play size={24} className="text-green-600 fill-green-600 ml-1" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 leading-tight flex-1 pr-2">{getTitle(v)}</h3>
                    <button
                      onClick={() => setMenuOpen(menuOpen === i ? null : i)}
                      className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  <p className="text-xs text-gray-400">YouTube</p>
                </div>

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
