"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Forward, CheckCircle, Clock } from "lucide-react";

export default function SupportTickets({ adminUser }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleForward = async (ticket) => {
    const docEmail = prompt("Enter Doctor's Email to forward this ticket:");
    if (!docEmail) return;

    // Trigger mailto:
    const subject = encodeURIComponent(`Forwarded Ticket from Infy: ${ticket.subject}`);
    const body = encodeURIComponent(`Hello Doctor,\n\nPlease review the following query from an Infy user:\n\nUser: ${ticket.userEmail || "Anonymous"}\nType: ${ticket.type}\n\nMessage:\n${ticket.message}\n\nThank you,\nInfy Admin: ${adminUser.username}`);
    
    window.location.href = `mailto:${docEmail}?subject=${subject}&body=${body}`;

    // Mark as forwarded
    try {
      await updateDoc(doc(db, "support_tickets", ticket.id), { status: "forwarded", forwardedTo: docEmail, forwardedAt: new Date().toISOString() });
    } catch(err) {
      console.error("Error updating ticket status:", err);
    }
  };

  const handleResolve = async (ticket) => {
    try {
      await updateDoc(doc(db, "support_tickets", ticket.id), { status: "resolved", resolvedAt: new Date().toISOString() });
    } catch(err) {
      console.error("Error updating ticket status:", err);
    }
  };

  if (loading) return <div className="text-gray-500">Loading tickets...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-gray-900">Support & Health Tickets</h2>
        <p className="text-sm text-gray-500">Manage user messages and forward to doctors.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className={`p-6 rounded-2xl border flex flex-col gap-4 shadow-sm bg-white ${ticket.status === 'resolved' ? 'border-gray-200 opacity-70' : ticket.status === 'forwarded' ? 'border-blue-200' : 'border-orange-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${ticket.type === 'health' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {ticket.type === 'health' ? 'Health Query' : 'Support Ticket'}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">{ticket.subject}</h3>
                <p className="text-xs text-gray-500 mt-1">From: {ticket.userEmail || "Anonymous"} • {new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                  {ticket.status === 'resolved' ? <><CheckCircle size={14} className="text-green-500"/> Resolved</> : ticket.status === 'forwarded' ? <><Forward size={14} className="text-blue-500"/> Forwarded</> : <><Clock size={14} className="text-orange-500"/> Pending</>}
                </span>
                {ticket.forwardedTo && <p className="text-[10px] text-gray-400">to {ticket.forwardedTo}</p>}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-800 whitespace-pre-wrap border border-gray-100">
              {ticket.message}
            </div>

            <div className="flex gap-2 justify-end mt-2">
              {ticket.status !== 'resolved' && (
                <button onClick={() => handleResolve(ticket)} className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-bold transition flex items-center gap-2">
                  <CheckCircle size={16} /> Mark Resolved
                </button>
              )}
              <button onClick={() => handleForward(ticket)} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm">
                <Forward size={16} /> Forward to Doctor
              </button>
            </div>
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="text-center p-8 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">No tickets yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
