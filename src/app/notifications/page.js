"use client";
import { BellRing, CheckCircle2, AlertCircle, Calendar, Activity } from "lucide-react";
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
  const nextTarget = new Date(birthDate.getFullYear(), birthDate.getMonth() + completedMonths + 1, birthDate.getDate());
  
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
    // Notifications Generation
    const defaultNotifs = [
       { title: "Successful Login", desc: "You have successfully signed in to Infy from a new device.", time: "Just now", unread: true },
       { title: "Welcome to Infy", desc: "Great to have you! Don't forget to set up your profile and dashboard.", time: "1 hr ago", unread: false }
    ];

    const actions = [];

    if (kids.length > 0) {
       kids.forEach((k) => {
         defaultNotifs.unshift({
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

    setNotifications(defaultNotifs);
    setActionItems(actions);
  }, [kids]);

  return (
    <div className="flex flex-col h-[calc(100dvh-72px)] overflow-y-auto overscroll-y-contain animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 space-y-6 pb-safe">
      
      {/* Tab Switcher */}
      <div className="fixed left-0 right-0 max-w-md mx-auto z-20 bg-white pt-3 pb-1" style={{ top: 'calc(4.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="mx-4 bg-white p-2 rounded-full flex items-center justify-between border border-gray-200 shadow-sm">
          <div className="flex flex-1 items-center gap-1">
            <button 
              onClick={() => setActiveTab("updates")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-full transition-all duration-200 ${
                activeTab === "updates"
                  ? "bg-green-50/50 border border-[#027027] shadow-sm"
                  : "bg-transparent border border-transparent"
              }`}
            >
              <div className="text-center leading-tight overflow-hidden">
                <p className={`font-bold text-sm truncate ${activeTab === 'updates' ? 'text-[#027027]' : 'text-gray-600'}`}>All</p>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab("actions")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-full transition-all duration-200 ${
                activeTab === "actions"
                  ? "bg-red-50/50 border border-red-500 shadow-sm"
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

      <div className="space-y-3 overscroll-y-contain" style={{ paddingTop: '140px' }}>
        {activeTab === "updates" ? (
          notifications.length > 0 ? notifications.map((n, i) => (
            <div key={i} className={`p-5 rounded-3xl border ${n.unread ? 'bg-[#027027]/5 border-[#027027]/20' : 'bg-white border-gray-100'} shadow-sm flex items-start gap-4`}>
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
            <div key={i} className="p-5 rounded-3xl border bg-red-50 border-red-100 shadow-sm flex flex-col gap-3">
               <div className="flex items-center gap-3">
                 <div className="p-3 rounded-full shadow-inner flex-shrink-0 bg-red-500 text-white">
                    {a.icon}
                 </div>
                 <div>
                    <h3 className="font-bold text-[16px] text-red-900">{a.title}</h3>
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider">{a.kidName}</p>
                 </div>
               </div>
               <p className="text-sm text-red-700 leading-relaxed pl-1">{a.desc}</p>
               <Link href="/kids" className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-center transition active:scale-95 text-sm shadow-sm">
                 Resolve Now
               </Link>
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
