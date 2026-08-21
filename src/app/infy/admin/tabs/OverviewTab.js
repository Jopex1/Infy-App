"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, query, where, limit } from "firebase/firestore";
import { Users, Activity, MessageCircle, BarChart3, TrendingUp } from "lucide-react";

export default function OverviewTab() {
  const [stats, setStats] = useState({
    users: 0,
    children: 0,
    visitorsToday: 0,
    visitorsTotal: 0,
    tickets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Users
        const usersSnap = await getDocs(collection(db, "users"));
        // Children
        const childrenSnap = await getDocs(collection(db, "children"));
        // Support Tickets
        const ticketsSnap = await getDocs(collection(db, "support_tickets"));
        
        // Visitors
        const analyticsSnap = await getDocs(collection(db, "analytics"));
        let totalVisits = 0;
        let todayVisits = 0;
        const today = new Date().toISOString().split('T')[0];
        
        analyticsSnap.forEach(doc => {
          totalVisits += (doc.data().visitors || 0);
          if (doc.id === today) {
            todayVisits = doc.data().visitors || 0;
          }
        });

        setStats({
          users: usersSnap.empty ? 0 : usersSnap.size, // If users collection isn't exactly accurate, it's a rough estimate
          children: childrenSnap.size,
          visitorsToday: todayVisits,
          visitorsTotal: totalVisits,
          tickets: ticketsSnap.size
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-gray-500">Loading dashboard metrics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Visitors" value={stats.visitorsToday} icon={<TrendingUp size={24} className="text-green-500" />} />
        <StatCard title="Total Visitors" value={stats.visitorsTotal} icon={<BarChart3 size={24} className="text-blue-500" />} />
        <StatCard title="Total Children" value={stats.children} icon={<Users size={24} className="text-purple-500" />} />
        <StatCard title="Support Tickets" value={stats.tickets} icon={<MessageCircle size={24} className="text-orange-500" />} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <h4 className="font-bold text-green-900">Review Support Tickets</h4>
              <p className="text-sm text-green-700/80 mt-1">Check the Support Tickets tab to answer parent queries or forward them to pediatricians.</p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900">Manage Content</h4>
              <p className="text-sm text-blue-700/80 mt-1">Use Explore Videos or Learn More tabs to keep app content fresh and up to date.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
