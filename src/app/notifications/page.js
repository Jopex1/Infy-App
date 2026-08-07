"use client";
import { BellRing, CheckCircle2, Activity, Calendar, Play, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function getDaysToNext(records, dob) {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const completedMonths = (records && Array.isArray(records)) ? records.length : 0;
  const targetMonth = completedMonths === 0 ? 0 : completedMonths;
  const nextTarget = new Date(birthDate.getFullYear(), birthDate.getMonth() + targetMonth, birthDate.getDate());
  
  const diffMs = nextTarget.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return daysLeft < 0 ? 0 : daysLeft;
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("updates");
  const [notifications, setNotifications] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [kids, setKids] = useState([]);
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [pressTimer, setPressTimer] = useState(null);

  const handlePressStart = (type, itemIndex, item) => {
    const timer = setTimeout(() => {
      if (confirm("Delete this item?")) {
        if (type === 'watchlist') {
          removeWatchlist(item.videoId);
        } else if (type === 'action') {
          setActionItems(prev => prev.filter((_, i) => i !== itemIndex));
        } else {
          setNotifications(prev => prev.filter((_, i) => i !== itemIndex));
        }
      }
    }, 600);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("infy_watchlist") || "[]");
    setWatchlist(list);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setKids([]);
      return;
    }
    const q = query(collection(db, "children"), where("userId", "==", user.uid));
    const unsubscribeDb = onSnapshot(q, (snapshot) => {
      const kidsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setKids(kidsData);
    });
    return () => unsubscribeDb();
  }, [user]);

  useEffect(() => {
    // Load local storage notifications
    let localNotifs = JSON.parse(localStorage.getItem("infy_notifications") || "[]");

    // Add default fallbacks if completely empty
    if (localNotifs.length === 0 && kids.length === 0) {
      localNotifs = [
         { id: "def_1", title: "Successful Login", desc: "You have successfully signed in to Infy from a new device.", time: "Just now", unread: true },
         { id: "def_2", title: "Welcome to Infy", desc: "Great to have you! Don't forget to set up your profile and dashboard.", time: "1 hr ago", unread: false }
      ];
    }

    const dynamicNotifs = [];
    const actions = [];

    if (kids.length > 0) {
       kids.forEach((k) => {
         dynamicNotifs.unshift({
           id: `profile_${k.id}`,
           title: "New Profile Added",
           desc: `Tracking initialized for ${k.name}. We'll monitor upcoming weigh-ins!`,
           time: "Just now",
           unread: true
         });

         // Action Items Generation
         const vaccineDaysLeft = getDaysToNext(k.vaccineRecords, k.dob);
         const weighingDaysLeft = getDaysToNext(k.weighingRecords, k.dob);

         if (vaccineDaysLeft === 0) {
            actions.push({
               type: 'vaccine',
               kidId: k.id,
               kidName: k.name,
               title: "Vaccination Due",
               desc: `It's time for ${k.name}'s next vaccination. Visit the clinic soon.`,
               icon: <Calendar size={20} />
            });
         }
         if (weighingDaysLeft === 0) {
            actions.push({
               type: 'weighing',
               kidId: k.id,
               kidName: k.name,
               title: "Weighing Due",
               desc: `Please record a new weight for ${k.name} to keep the growth chart updated.`,
               icon: <Activity size={20} />
            });
         }
       });
    }

    watchlist.forEach((item) => {
      actions.push({
        type: 'watchlist',
        kidId: 'Watchlist',
        kidName: 'Watchlist',
        title: item.title,
        desc: 'You added this video to your watchlist to view later.',
        videoId: item.id
      });
    });

    const combinedNotifs = [...dynamicNotifs, ...localNotifs];

    setNotifications(combinedNotifs.map(n => ({...n, unread: false})));
    setActionItems(actions);
  }, [kids, watchlist]);

  // Mark all as read in localStorage on mount and when viewed
  useEffect(() => {
    const clearBadge = () => {
      const localNotifs = JSON.parse(localStorage.getItem("infy_notifications") || "[]");
      if (localNotifs.some(n => n.unread)) {
        const readLocal = localNotifs.map(n => ({...n, unread: false}));
        localStorage.setItem("infy_notifications", JSON.stringify(readLocal));
        window.dispatchEvent(new Event("storage"));
      }
    };
    clearBadge();
    const t = setTimeout(clearBadge, 500);
    return () => clearTimeout(t);
  }, []);

  const removeWatchlist = (id) => {
    const updated = watchlist.filter(w => w.id !== id);
    setWatchlist(updated);
    localStorage.setItem("infy_watchlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Tab Switcher - sticky */}
      <div className="fixed left-0 right-0 max-w-md mx-auto z-20 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md px-4 pt-3 pb-3 border-b border-gray-100 dark:border-[#222]" style={{ top: 'calc(4.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="bg-white dark:bg-[#222] p-2 rounded-full flex items-center justify-between border-2 border-[#027027]/20 shadow-sm">
            <div className="flex flex-1 items-center gap-1">
              <button 
                onClick={() => setActiveTab("updates")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-full transition-all duration-200 ${
                  activeTab === "updates"
                    ? "bg-green-50/50 border border-[#027027]"
                    : "bg-transparent border border-transparent"
                }`}
              >
                <div className="text-center leading-tight overflow-hidden flex items-center justify-center gap-1.5">
                  <p className={`font-bold text-sm truncate ${activeTab === 'updates' ? 'text-[#027027]' : 'text-gray-600'}`}>All</p>
                  {notifications.filter(n => n.unread).length > 0 && <span className="bg-[#f7e03c] text-gray-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{notifications.filter(n => n.unread).length}</span>}
                </div>
              </button>
              <button 
                onClick={() => setActiveTab("actions")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-full transition-all duration-200 ${
                  activeTab === "actions"
                    ? "bg-red-50/50 border border-red-500"
                    : "bg-transparent border border-transparent"
                }`}
              >
                <div className="text-center leading-tight overflow-hidden flex items-center justify-center gap-1.5">
                  <p className={`font-bold text-sm truncate ${activeTab === 'actions' ? 'text-red-600' : 'text-gray-600'}`}>Action Forms</p>
                  {actionItems.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{actionItems.length}</span>}
                </div>
              </button>
            </div>
      </div>
        </div>

      {/* Content */}
      <div className="p-4 pt-[90px] pb-safe">
        <div className="space-y-3">
        {activeTab === "updates" ? (
          notifications.length > 0 ? notifications.map((n, i) => (
            <div 
              key={i} 
              onTouchStart={() => handlePressStart('notification', i, n)}
              onTouchEnd={handlePressEnd}
              onMouseDown={() => handlePressStart('notification', i, n)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              className={`p-5 rounded-3xl border ${n.unread ? 'bg-[#027027]/5 border-[#027027]/20' : 'bg-white border-gray-100'} shadow-sm flex items-start gap-4 transition-transform active:scale-[0.98] cursor-pointer`}
            >
               <div className={`p-3 rounded-full shadow-inner flex-shrink-0 ${n.unread ? 'bg-[#027027] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {n.unread ? <BellRing size={22} /> : <CheckCircle2 size={22} />}
               </div>
               <div>
                  <h3 className={`font-bold text-[16px] ${n.unread ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{n.desc}</p>
                  <span className="text-xs font-bold text-gray-400 mt-3 block uppercase tracking-wider">{n.time}</span>
               </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 py-10">No new updates.</p>
          )
        ) : (
          actionItems.length > 0 ? actionItems.map((a, i) => (
            <div 
              key={i} 
              onTouchStart={() => handlePressStart(a.type === 'watchlist' ? 'watchlist' : 'action', i, a)}
              onTouchEnd={handlePressEnd}
              onMouseDown={() => handlePressStart(a.type === 'watchlist' ? 'watchlist' : 'action', i, a)}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              className={`p-5 rounded-3xl border ${a.type === 'watchlist' ? 'bg-white border-green-100' : 'bg-red-50 border-red-100'} shadow-sm flex flex-col gap-3 relative transition-transform active:scale-[0.98] cursor-pointer`}
            >
               {a.type === 'watchlist' && (
                 <button 
                   onClick={() => removeWatchlist(a.videoId)}
                   className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition p-1"
                 >
                   <X size={18} />
                 </button>
               )}
               <div className="flex items-center gap-3 pr-6">
                 {a.type === 'watchlist' ? (
                   <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                     <img src={`https://img.youtube.com/vi/${a.videoId}/default.jpg`} alt="thumbnail" className="w-full h-full object-cover" />
                   </div>
                 ) : (
                   <div className="p-3 rounded-full shadow-inner flex-shrink-0 bg-red-500 text-white">
                      {a.icon}
                   </div>
                 )}
                 <div>
                    <h3 className={`font-bold text-[16px] ${a.type === 'watchlist' ? 'text-[#027027]' : 'text-red-900'}`}>{a.title}</h3>
                    <p className={`text-xs font-bold uppercase tracking-wider ${a.type === 'watchlist' ? 'text-gray-500' : 'text-red-500'}`}>{a.kidName}</p>
                 </div>
               </div>
               <p className={`text-sm leading-relaxed pl-1 ${a.type === 'watchlist' ? 'text-gray-600' : 'text-red-700'}`}>{a.desc}</p>
               {a.type === 'watchlist' ? (
                 <a href={`https://www.youtube.com/watch?v=${a.videoId}`} target="_blank" rel="noreferrer" className="mt-2 bg-[#027027] hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-center transition active:scale-95 text-sm shadow-sm">
                   Watch Now
                 </a>
               ) : (
                 <Link href="/kids" className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-center transition active:scale-95 text-sm shadow-sm">
                   Resolve Now
                 </Link>
               )}
            </div>
          )) : (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="bg-green-50 text-[#027027] p-4 rounded-full mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">All caught up!</h3>
              <p className="text-sm text-gray-500 mt-1">There are no pending action items right now.</p>
            </div>
          )
        )}
        </div>
      </div>
    </div>
  );
}
