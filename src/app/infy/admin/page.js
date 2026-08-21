"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { Users, LayoutDashboard, FileText, Video, ShieldAlert, LogOut, MessageSquare, Plus, Trash2, Forward } from "lucide-react";
import Image from "next/image";

// Components
import AdminsTab from "./tabs/AdminsTab";
import OverviewTab from "./tabs/OverviewTab";
import ExploreCMS from "./tabs/ExploreCMS";
import LearnMoreCMS from "./tabs/LearnMoreCMS";
import SupportTickets from "./tabs/SupportTickets";

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const [lastTicketCount, setLastTicketCount] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const sessionStr = sessionStorage.getItem("infy_admin_session");
    if (!sessionStr) {
      router.replace("/infy/admin/login");
      return;
    }
    const session = JSON.parse(sessionStr);
    setAdminUser(session);
  }, [router]);

  useEffect(() => {
    if (!adminUser) return;
    const q = query(collection(db, "support_tickets"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const currentCount = snap.size;
      if (!isFirstLoad && currentCount > lastTicketCount) {
        const newest = snap.docs.map(d => d.data()).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        if (newest) {
          setToast(`New Ticket: ${newest.subject}`);
          setTimeout(() => setToast(null), 5000);
        }
      }
      setLastTicketCount(currentCount);
      setIsFirstLoad(false);
    });
    return () => unsubscribe();
  }, [adminUser, isFirstLoad, lastTicketCount]);

  const handleLogout = () => {
    sessionStorage.removeItem("infy_admin_session");
    router.replace("/infy/admin/login");
  };

  if (!adminUser) return <div className="p-8 text-center" style={{ color: "#027027" }}>Loading Admin...</div>;

  const isSuper = adminUser.role === "SUPER_ADMIN";

  return (
    <div className="flex h-screen font-sans" style={{ background: "#f0f7f0" }}>
      {/* Sidebar - Laptop */}
      <aside className="hidden md:flex flex-col w-64 text-white shadow-2xl" style={{ background: "#014d1a" }}>
        <div className="p-6 pb-4 border-b" style={{ borderColor: "#027027" }}>
          <div className="relative w-24 h-8 mb-3">
            <Image src="/icons/infy_wordmark_mono_1.png" alt="Infy" fill className="object-contain brightness-0 invert" />
          </div>
          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#86efac" }}>Admin Portal</p>
          <p className="text-xs mt-1" style={{ color: "#bbf7d0" }}>{adminUser.username || adminUser.role}</p>
        </div>
        
        <nav className="flex-1 mt-4 space-y-1 px-3">
          <NavItem active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<LayoutDashboard size={20}/>} label="Overview" />
          <NavItem active={activeTab === "support"} onClick={() => setActiveTab("support")} icon={<MessageSquare size={20}/>} label="Support Tickets" />
          <NavItem active={activeTab === "explore_cms"} onClick={() => setActiveTab("explore_cms")} icon={<Video size={20}/>} label="Explore Videos" />
          <NavItem active={activeTab === "learn_more_cms"} onClick={() => setActiveTab("learn_more_cms")} icon={<FileText size={20}/>} label="Learn More" />
          {isSuper && <NavItem active={activeTab === "admins"} onClick={() => setActiveTab("admins")} icon={<ShieldAlert size={20}/>} label="Manage Admins" />}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "#027027" }}>
          <p className="text-[10px] uppercase tracking-widest mb-3 font-bold" style={{ color: "#86efac" }}>{adminUser.role}</p>
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-semibold w-full p-2 rounded-xl transition hover:bg-white/10" style={{ color: "#fca5a5" }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden text-white p-4 flex justify-between items-center shadow-lg" style={{ background: "#014d1a" }}>
          <div className="relative w-20 h-7">
            <Image src="/icons/infy_wordmark_mono_1.png" alt="Infy" fill className="object-contain brightness-0 invert" />
          </div>
          <select 
            value={activeTab} 
            onChange={e => setActiveTab(e.target.value)}
            className="text-sm border-none outline-none rounded-lg p-1.5 font-bold"
            style={{ background: "#027027", color: "white" }}
          >
            <option value="overview">Overview</option>
            <option value="support">Support Tickets</option>
            <option value="explore_cms">Explore Videos</option>
            <option value="learn_more_cms">Learn More</option>
            {isSuper && <option value="admins">Manage Admins</option>}
          </select>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8" style={{ background: "#f0f7f0" }}>
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "support" && <SupportTickets adminUser={adminUser} />}
          {activeTab === "explore_cms" && <ExploreCMS />}
          {activeTab === "learn_more_cms" && <LearnMoreCMS />}
          {activeTab === "admins" && isSuper && <AdminsTab />}
        </div>
      </main>

      {/* Bubble Banner (Toast) */}
      {toast && (
        <div className="fixed top-4 right-4 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300 z-[9999]" style={{ background: "#027027" }}>
          <MessageSquare size={20} />
          <div>
            <p className="font-bold text-sm">New Support Ticket</p>
            <p className="text-xs" style={{ color: "#bbf7d0" }}>{toast}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 hover:text-white/70 transition" style={{ color: "#86efac" }}>
            <Plus size={20} className="rotate-45" />
          </button>
        </div>
      )}
    </div>
  );
}

function NavItem({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left text-sm font-semibold"
      style={active
        ? { background: "#027027", color: "white" }
        : { color: "#bbf7d0" }
      }
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#bbf7d0"; } }}
    >
      {icon}
      {label}
    </button>
  );
}
