"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Users, Activity, MessageCircle, BarChart3, TrendingUp } from "lucide-react";

export default function OverviewTab() {
  const [stats, setStats] = useState({ users: 0, children: 0, visitorsToday: 0, visitorsTotal: 0, tickets: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const childrenSnap = await getDocs(collection(db, "children"));
        const ticketsSnap = await getDocs(collection(db, "support_tickets"));
        const analyticsSnap = await getDocs(collection(db, "analytics"));
        let totalVisits = 0, todayVisits = 0;
        const today = new Date().toISOString().split('T')[0];
        analyticsSnap.forEach(doc => {
          totalVisits += (doc.data().visitors || 0);
          if (doc.id === today) todayVisits = doc.data().visitors || 0;
        });
        setStats({ users: usersSnap.size, children: childrenSnap.size, visitorsToday: todayVisits, visitorsTotal: totalVisits, tickets: ticketsSnap.size });
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="font-bold" style={{ color: "#027027" }}>Loading dashboard metrics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black" style={{ color: "#014d1a" }}>Dashboard Overview</h2>
        <p className="mt-1 text-sm" style={{ color: "#4caf50" }}>Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Visitors" value={stats.visitorsToday} icon={<TrendingUp size={22} />} color="#027027" bg="#e8f5e9" />
        <StatCard title="Total Visitors" value={stats.visitorsTotal} icon={<BarChart3 size={22} />} color="#027027" bg="#f0f7f0" />
        <StatCard title="Total Children" value={stats.children} icon={<Users size={22} />} color="#014d1a" bg="#c8e6c9" />
        <StatCard title="Support Tickets" value={stats.tickets} icon={<MessageCircle size={22} />} color="#027027" bg="#e8f5e9" />
      </div>

      <div className="p-6 rounded-2xl shadow-sm border" style={{ background: "white", borderColor: "#c8e6c9" }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: "#014d1a" }}>Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border flex items-start gap-4" style={{ background: "#f0f7f0", borderColor: "#c8e6c9" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#c8e6c9", color: "#014d1a" }}>
              <Activity size={20} />
            </div>
            <div>
              <h4 className="font-bold" style={{ color: "#014d1a" }}>Review Support Tickets</h4>
              <p className="text-sm mt-1" style={{ color: "#4caf50" }}>Check the Support Tickets tab to answer parent queries or forward to pediatricians.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border flex items-start gap-4" style={{ background: "#f0f7f0", borderColor: "#c8e6c9" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#c8e6c9", color: "#014d1a" }}>
              <Users size={20} />
            </div>
            <div>
              <h4 className="font-bold" style={{ color: "#014d1a" }}>Manage Content</h4>
              <p className="text-sm mt-1" style={{ color: "#4caf50" }}>Use Explore Videos or Learn More tabs to keep app content fresh and up to date.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className="p-5 rounded-2xl shadow-sm border flex items-center gap-4" style={{ background: "white", borderColor: "#c8e6c9" }}>
      <div className="p-3 rounded-xl" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4caf50" }}>{title}</p>
        <p className="text-3xl font-black mt-1" style={{ color: "#014d1a" }}>{value}</p>
      </div>
    </div>
  );
}
