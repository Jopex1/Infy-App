"use client";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Play, MoreVertical, Share2, MessageCircle, Bookmark, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

const PLACEHOLDER = (slot) => ({ id: `PLACEHOLDER_${slot}`, placeholder: true });

const categories = [
  { title: "Nutrition", icon: "🥗", image: "/images/thumbnails/nutrition.jpg.jpeg", color: "bg-orange-50 border-orange-200", iconBg: "bg-orange-100", videos: [PLACEHOLDER("NUT"), { id: "c7Yr3KNnujs" }, { id: "SA_9qmMOR3U" }] },
  { title: "Vaccination", icon: "💉", image: "/images/thumbnails/health and wellness.jpg.jpeg", color: "bg-[#e8ece5] border-[#c0d1b6]", iconBg: "bg-green-100", videos: [PLACEHOLDER("VAC"), { id: "LRdoBofFcNs" }, { id: "kQWiSM-98MA" }] },
  { title: "Child Development", icon: "🧠", image: "/images/thumbnails/child development.jpg.jpeg", color: "bg-purple-50 border-purple-200", iconBg: "bg-purple-100", videos: [PLACEHOLDER("CHD"), { id: "i3oAo0FSpn8" }, { id: "VVmMK4ZcPxY" }] },
  { title: "Newborn Care", icon: "👶", image: "/images/thumbnails/Newborn Care.jpeg", color: "bg-pink-50 border-pink-200", iconBg: "bg-pink-100", videos: [PLACEHOLDER("NEW"), { id: "2vqhTU16Dr4" }, { id: "JvmTlvBUhuQ" }] },
  { title: "Health & Wellness", icon: "❤️", image: "/images/thumbnails/health and wellness.jpg.jpeg", color: "bg-red-50 border-red-200", iconBg: "bg-red-100", videos: [PLACEHOLDER("HLT"), { id: "9RVvxFNhHdI" }, { id: "Oe0hfVNfLAI" }] },
  { title: "Safety & First Aid", icon: "🩺", image: "/images/thumbnails/Safety and First AId.jpeg", color: "bg-teal-50 border-teal-200", iconBg: "bg-teal-100", videos: [PLACEHOLDER("SAF"), { id: "3F4XH7ACWOY" }, { id: "wF9kO_k47Lw" }] },
  { title: "Parenting", icon: "🏠", image: "/images/thumbnails/Parenting.jpeg", color: "bg-yellow-50 border-yellow-200", iconBg: "bg-yellow-100", videos: [PLACEHOLDER("PAR"), { id: "7_2f4hKqDsw" }, { id: "v_eO4xWpT58" }] },
  { title: "Growth Milestones", icon: "📏", image: "/images/thumbnails/Growth Milestone.jpg.jpeg", color: "bg-green-50 border-green-200", iconBg: "bg-green-100", videos: [PLACEHOLDER("GRW"), { id: "i3oAo0FSpn8" }, { id: "VVmMK4ZcPxY" }] },
  { title: "Sleep & Rest", icon: "🌙", image: "/images/thumbnails/Sleep and Rest .jpeg", color: "bg-indigo-50 border-indigo-200", iconBg: "bg-indigo-100", videos: [PLACEHOLDER("SLP"), { id: "eB11Lw5e8nE" }, { id: "y2jV45P4E-E" }] },
  { title: "Hygiene & Care", icon: "🛁", image: "/images/thumbnails/Hygein and Care.jpg.jpeg", color: "bg-sky-50 border-sky-200", iconBg: "bg-sky-100", videos: [PLACEHOLDER("HYG"), { id: "p5yC5o-Pq5k" }, { id: "Y1J9C75x24Q" }] },
  { title: "Learning & Play", icon: "🎨", image: "/images/thumbnails/Learning And Play.jpeg", color: "bg-lime-50 border-lime-100", iconBg: "bg-lime-100", videos: [PLACEHOLDER("LRN"), { id: "1uMv1Hk6tZk" }, { id: "2nN4jS8yQ8E" }] },
  { title: "Special Needs & Support", icon: "🤝", image: "/images/thumbnails/Learning And Play.jpeg", color: "bg-rose-50 border-rose-200", iconBg: "bg-rose-100", videos: [PLACEHOLDER("SPN"), { id: "wF9kO_k47Lw" }, { id: "7_2f4hKqDsw" }] },
];

export default function ExplorePage() {
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [videoTitles, setVideoTitles] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setWatchlist(JSON.parse(localStorage.getItem("infy_watchlist") || "[]"));

    const queuedVideo = JSON.parse(localStorage.getItem("infy_open_video") || "null");
    if (queuedVideo?.id) {
      const category = categories.find((item) => item.videos.some((video) => video.id === queuedVideo.id));
      if (category) {
        setSelected(category);
        setActiveVideoId(queuedVideo.id);
      }
      localStorage.removeItem("infy_open_video");
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen !== null ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  const allVideoIds = useMemo(() => [...new Set(categories.flatMap((cat) => cat.videos.filter(v => !v.placeholder).map((v) => v.id)))], []);

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
    localStorage.setItem("infy_ai_video", JSON.stringify({ link: videoLink, title, description: `YouTube video: ${title}` }));
    router.push("/chat");
  };

  const handleShare = async (video) => {
    const videoLink = `https://www.youtube.com/watch?v=${video.id}`;
    const title = getTitle(video);
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Watch: ${title}`, url: videoLink });
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

  const openVideoPreview = (video) => {
    setActiveVideoId(video.id);
    setMenuOpen(null);
  };

  return (
    <div className="min-h-screen pb-safe">
      {!selected ? (
        <div className="px-4 pt-5 grid grid-cols-2 gap-4 animate-in fade-in duration-300">
          {categories.map((cat, i) => (
            <button key={i} onClick={() => setSelected(cat)} className={`${cat.color} border rounded-3xl overflow-hidden flex flex-col items-center justify-center text-center active:scale-95 transition shadow-sm h-36 relative`}>
              {cat.image ? (
                <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className={`${cat.iconBg} ${cat.title === "Vaccination" ? 'text-6xl mb-4' : 'w-14 h-14 rounded-2xl shadow-inner mb-2 text-3xl'} flex items-center justify-center`}>
                    {cat.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-700 leading-tight px-2">{cat.title}</span>
                </>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col animate-in slide-in-from-right-8 fade-in duration-300 h-full">
          <div className="flex items-center gap-3 px-4 pb-4 border-b border-gray-100 bg-background sticky top-[calc(4.5rem+env(safe-area-inset-top,0px))] z-10 -mt-4 pt-4">
            <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition">
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className={`${selected.iconBg} w-8 h-8 rounded-lg flex items-center justify-center text-lg`}>{selected.icon}</div>
              <h2 className="text-lg font-bold text-gray-800">{selected.title}</h2>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {menuOpen !== null && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={() => setMenuOpen(null)} onTouchStart={() => setMenuOpen(null)} />}
            {selected.videos.map((v, i) => (
              <div key={i} className="bg-white rounded-[20px] shadow-sm border border-green-200 flex flex-col relative">
                <div className="aspect-video w-full relative bg-gray-900 rounded-t-[20px] overflow-hidden">
                  {v.placeholder ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 gap-2 px-4">
                      <div className="w-14 h-14 rounded-full bg-white/80 shadow flex items-center justify-center mb-1">
                        <Play size={26} className="text-gray-400 ml-1" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 text-center">YouTube link coming soon</p>
                      <p className="text-[10px] text-gray-400 text-center">Placeholder — add video ID to code</p>
                    </div>
                  ) : activeVideoId === v.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&controls=1&autohide=0&playsinline=1&fs=1`}
                      title={getTitle(v)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      tabIndex="0"
                      className="w-full h-full touch-manipulation"
                    />
                  ) : (
                    <>
                      <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt={getTitle(v)} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => openVideoPreview(v)} className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition">
                          <Play size={24} className="text-green-600 fill-green-600 ml-1" />
                        </div>
                      </button>
                    </>
                  )}
                </div>

                <div className="p-4 relative">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 leading-tight flex-1 pr-2">
                      {v.placeholder ? (
                        <span className="text-gray-400 italic text-sm">📌 Placeholder — add YouTube link</span>
                      ) : getTitle(v)}
                    </h3>
                    <div className="relative z-50">
                      <button onClick={() => setMenuOpen(menuOpen === i ? null : i)} className="text-gray-400 hover:text-gray-600 transition p-1">
                        <MoreVertical size={20} />
                      </button>

                      {menuOpen === i && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setMenuOpen(null)}>
                          <div className="bg-white rounded-[20px] shadow-xl border border-green-200 p-5 w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-gray-900 text-lg">Video Options</h3>
                              <button onClick={() => setMenuOpen(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition"><X size={20} /></button>
                            </div>

                            <button onClick={() => handleWatchOnYouTube(v)} className="w-full bg-white border border-green-200 rounded-[16px] p-3 shadow-sm flex items-center gap-4 hover:shadow-md transition relative z-10 mb-3 group">
                              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>
                              <div className="flex-1 text-left"><h4 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">Watch on YouTube</h4><p className="text-xs text-gray-500 leading-tight">Open this video on YouTube</p></div>
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>

                            <button onClick={() => handleShare(v)} className="w-full bg-white border border-green-200 rounded-[16px] p-3 shadow-sm flex items-center gap-4 hover:shadow-md transition relative z-10 mb-3 group">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0"><Share2 size={20} strokeWidth={2.5} /></div>
                              <div className="flex-1 text-left"><h4 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">Share</h4><p className="text-xs text-gray-500 leading-tight">Share this video with others</p></div>
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>

                            <button onClick={() => handleAskInfyAI(v)} className="w-full bg-white border border-green-200 rounded-[16px] p-3 shadow-sm flex items-center gap-4 hover:shadow-md transition relative z-10 mb-4 group">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#027027] flex-shrink-0"><MessageCircle size={20} strokeWidth={2.5} /></div>
                              <div className="flex-1 text-left"><h4 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">Ask Infy AI</h4><p className="text-xs text-gray-500 leading-tight">Get AI-powered answers</p></div>
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>

                            <button onClick={() => {
                              let current = [...watchlist];
                              const index = current.findIndex(w => w.id === v.id);
                              if (index > -1) {
                                current.splice(index, 1);
                                alert("Removed from Watchlist!");
                              } else {
                                current.push({ id: v.id, title: getTitle(v), addedAt: new Date().toISOString() });
                                const notifs = JSON.parse(localStorage.getItem("infy_notifications") || "[]");
                                notifs.unshift({ id: `wl_${Date.now()}`, title: "Video Added to Watchlist", desc: `This video was added to your watchlist on ${new Date().toLocaleString()}.`, time: "Just now", unread: true, type: "watchlist", timestamp: Date.now() });
                                localStorage.setItem("infy_notifications", JSON.stringify(notifs));
                                window.dispatchEvent(new Event("storage"));
                                alert("Added to Action Forms in notifications!");
                              }
                              setWatchlist(current);
                              localStorage.setItem("infy_watchlist", JSON.stringify(current));
                              setMenuOpen(null);
                            }} className="relative z-10 flex justify-center items-center gap-2 w-full bg-[#027027] hover:bg-[#014d1a] transition py-3.5 rounded-xl text-white font-bold text-sm shadow-md active:scale-95">
                              <Bookmark size={18} fill={watchlist.some(w => w.id === v.id) ? "currentColor" : "none"} />
                              <span>{watchlist.some(w => w.id === v.id) ? "Remove from Watchlist" : "Add to Watchlist"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">YouTube</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
