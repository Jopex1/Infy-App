"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { Forward, CheckCircle, Clock, X, Trash2 } from "lucide-react";

export default function SupportTickets({ adminUser }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState([]);
  const [forwardModal, setForwardModal] = useState(null); // ticket being forwarded

  useEffect(() => {
    const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getDocs(collection(db, "health_professionals")).then(snap => {
      setProfessionals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handleForwardTo = async (ticket, professional) => {
    const subject = encodeURIComponent(`Forwarded Ticket from Infy: ${ticket.subject}`);
    const body = encodeURIComponent(`Hello ${professional.name},\n\nPlease review the following query from an Infy user:\n\nUser: ${ticket.userEmail || "Anonymous"}\nType: ${ticket.type}\n\nMessage:\n${ticket.message}\n\nThank you,\nInfy Admin: ${adminUser.username}`);
    
    window.location.href = `mailto:${professional.email}?subject=${subject}&body=${body}`;

    try {
      await updateDoc(doc(db, "support_tickets", ticket.id), {
        status: "forwarded",
        forwardedTo: professional.email,
        forwardedToName: professional.name,
        forwardedAt: new Date().toISOString()
      });
    } catch(err) {
      console.error(err);
    }
    setForwardModal(null);
  };

  const handleResolve = async (ticket) => {
    try {
      await updateDoc(doc(db, "support_tickets", ticket.id), { status: "resolved", resolvedAt: new Date().toISOString() });
      if (ticket.userId) {
        await addDoc(collection(db, "user_notifications"), {
          userId: ticket.userId,
          title: "Infy Health Professionals responded",
          desc: "Infy Health Professionals has responded to your mail. Please check your Gmail app.",
          type: "support_response",
          createdAt: new Date().toISOString(),
          unread: true
        });
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleDelete = async (ticket) => {
    if (!confirm("Delete this ticket permanently?")) return;
    try { await deleteDoc(doc(db, "support_tickets", ticket.id)); }
    catch (err) { alert("Error deleting ticket: " + err.message); }
  };

  if (loading) return <div className="font-bold" style={{ color: "#027027" }}>Loading tickets...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-2xl shadow-sm border" style={{ borderColor: '#c8e6c9' }}>
        <h2 className="text-xl font-black" style={{ color: '#014d1a' }}>Support &amp; Health Tickets</h2>
        <p className="text-sm mt-1" style={{ color: '#4caf50' }}>Manage user messages and forward to doctors.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className={`p-6 rounded-2xl border flex flex-col gap-4 shadow-sm bg-white ${ticket.status === 'resolved' ? 'opacity-70' : ''}`}
            style={{ borderColor: ticket.status === 'forwarded' ? '#c8e6c9' : ticket.status === 'resolved' ? '#e5e7eb' : '#fde68a' }}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full`}
                  style={{ background: ticket.type === 'health' ? '#fef2f2' : '#f0f7f0', color: ticket.type === 'health' ? '#dc2626' : '#027027' }}>
                  {ticket.type === 'health' ? 'Health Query' : 'Support Ticket'}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">{ticket.subject}</h3>
                <p className="text-xs text-gray-500 mt-1">From: {ticket.userEmail || "Anonymous"} • {new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                  {ticket.status === 'resolved' ? <><CheckCircle size={14} className="text-green-500"/> Resolved</> : ticket.status === 'forwarded' ? <><Forward size={14} style={{ color: '#027027' }}/> Forwarded</> : <><Clock size={14} className="text-orange-500"/> Pending</>}
                </span>
                {ticket.forwardedToName && <p className="text-[10px] text-gray-400">to {ticket.forwardedToName}</p>}
              </div>
            </div>
            
            <div className="p-4 rounded-xl text-sm text-gray-800 whitespace-pre-wrap border" style={{ background: "#f9fafb", borderColor: "#f3f4f6" }}>
              {ticket.message}
            </div>

            <div className="flex gap-2 justify-end mt-2">
              {ticket.status !== 'resolved' && (
                <button onClick={() => handleResolve(ticket)} className="px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2" style={{ background: '#e8f5e9', color: '#027027' }}>
                  <CheckCircle size={16} /> Mark Resolved
                </button>
              )}
              <button onClick={() => setForwardModal(ticket)} className="px-4 py-2 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm" style={{ background: '#027027' }}>
                <Forward size={16} /> Forward to Doctor
              </button>
              <button onClick={() => handleDelete(ticket)} className="px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="text-center p-8 bg-white rounded-2xl border" style={{ borderColor: "#c8e6c9" }}>
            <p className="text-gray-500">No tickets yet.</p>
          </div>
        )}
      </div>

      {/* Forward Modal */}
      {forwardModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setForwardModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black" style={{ color: "#014d1a" }}>Forward to Health Professional</h3>
              <button onClick={() => setForwardModal(null)} className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Select a professional to forward: <strong className="text-gray-800">"{forwardModal.subject}"</strong></p>
            
            {professionals.length === 0 ? (
              <div className="text-center p-6 rounded-xl" style={{ background: "#f0f7f0" }}>
                <p className="text-sm font-bold" style={{ color: "#027027" }}>No health professionals added yet.</p>
                <p className="text-xs text-gray-500 mt-1">Go to the Users tab → Health Professionals to add some.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {professionals.map(pro => (
                  <button key={pro.id} onClick={() => handleForwardTo(forwardModal, pro)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition hover:shadow-md"
                    style={{ borderColor: "#c8e6c9", background: "#f9fffe" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shrink-0" style={{ background: "#e8f5e9", color: "#027027" }}>
                      {pro.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{pro.name}</p>
                      <p className="text-xs truncate" style={{ color: "#4caf50" }}>{pro.role} · {pro.email}</p>
                    </div>
                    <Forward size={16} style={{ color: "#027027", flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
