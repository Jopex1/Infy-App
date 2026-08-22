"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Users, Trash2, UserPlus, Search, RefreshCw, Phone, Mail, Briefcase } from "lucide-react";

export default function UsersTab({ adminUser }) {
  const isSuper = adminUser?.role === "SUPER_ADMIN";
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [activeSection, setActiveSection] = useState("users"); // "users" | "professionals"
  const [professionals, setProfessionals] = useState([]);
  const [newPro, setNewPro] = useState({ name: "", phone: "", email: "", role: "" });
  const [addingPro, setAddingPro] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(`Users service returned an invalid response (${res.status}). Check Firebase Admin credentials.`); }
      if (!res.ok) throw new Error(data.error || `Users service failed (${res.status}).`);
      if (data.error) throw new Error(data.error);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchProfessionals = async () => {
    const snap = await getDocs(collection(db, "health_professionals"));
    setProfessionals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchUsers();
    fetchProfessionals();
  }, []);

  const handleDelete = async (uid, email) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setDeletingId(uid);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUsers(prev => prev.filter(u => u.uid !== uid));
      setTotal(prev => prev - 1);
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
    setDeletingId(null);
  };

  const handleAddPro = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "health_professionals"), { ...newPro, createdAt: new Date().toISOString() });
      setNewPro({ name: "", phone: "", email: "", role: "" });
      setAddingPro(false);
      fetchProfessionals();
    } catch (err) {
      alert("Error adding professional: " + err.message);
    }
  };

  const handleDeletePro = async (id) => {
    if (!confirm("Remove this health professional?")) return;
    await deleteDoc(doc(db, "health_professionals", id));
    fetchProfessionals();
  };

  const filtered = users.filter(u =>
    (u.email + u.displayName).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Section Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setActiveSection("users")} className="px-5 py-2.5 rounded-xl font-bold text-sm transition" style={activeSection === "users" ? { background: "#027027", color: "white" } : { background: "white", color: "#027027", border: "1px solid #c8e6c9" }}>
          <span className="flex items-center gap-2"><Users size={16}/> App Users</span>
        </button>
        <button onClick={() => setActiveSection("professionals")} className="px-5 py-2.5 rounded-xl font-bold text-sm transition" style={activeSection === "professionals" ? { background: "#027027", color: "white" } : { background: "white", color: "#027027", border: "1px solid #c8e6c9" }}>
          <span className="flex items-center gap-2"><Briefcase size={16}/> Health Professionals</span>
        </button>
      </div>

      {activeSection === "users" && (
        <>
          {/* Stats */}
          <div className="p-6 rounded-2xl shadow-sm border flex justify-between items-center" style={{ background: "white", borderColor: "#c8e6c9" }}>
            <div>
              <h2 className="text-xl font-black" style={{ color: "#014d1a" }}>App Users</h2>
              <p className="text-sm mt-1" style={{ color: "#4caf50" }}>Total registered users: <strong style={{ color: "#027027" }}>{total}</strong></p>
            </div>
            <button onClick={fetchUsers} className="p-2 rounded-xl transition" style={{ background: "#f0f7f0" }}>
              <RefreshCw size={20} style={{ color: "#027027" }} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#4caf50" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
              style={{ background: "white", borderColor: "#c8e6c9" }}
            />
          </div>

          {error && <div className="p-4 rounded-xl text-sm" style={{ background: "#fef2f2", color: "#dc2626" }}>{error}</div>}

          {loading ? (
            <p className="font-bold" style={{ color: "#027027" }}>Loading users...</p>
          ) : (
            <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: "#c8e6c9" }}>
              <table className="w-full text-sm text-left">
                <thead style={{ background: "#f0f7f0" }}>
                  <tr>
                    <th className="p-4 font-bold uppercase text-xs" style={{ color: "#027027" }}>User</th>
                    <th className="p-4 font-bold uppercase text-xs hidden md:table-cell" style={{ color: "#027027" }}>Provider</th>
                    <th className="p-4 font-bold uppercase text-xs hidden md:table-cell" style={{ color: "#027027" }}>Joined</th>
                    <th className="p-4 font-bold uppercase text-xs" style={{ color: "#027027" }}>Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{ borderColor: "#e8f5e9" }}>
                  {filtered.map(user => (
                    <tr key={user.uid} className="hover:bg-green-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <img src={user.photoURL} className="w-9 h-9 rounded-full object-cover border-2" style={{ borderColor: "#c8e6c9" }} />
                          ) : (
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "#e8f5e9", color: "#027027" }}>
                              {(user.displayName || user.email || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{user.displayName || "—"}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize" style={{ background: "#e8f5e9", color: "#027027" }}>
                          {user.provider.replace(".com", "")}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs hidden md:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(user.uid, user.email)}
                          disabled={deletingId === user.uid}
                          className="p-2 rounded-lg hover:bg-red-50 transition text-red-400 hover:text-red-600 disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-400">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeSection === "professionals" && (
        <>
          <div className="p-6 rounded-2xl shadow-sm border flex justify-between items-center" style={{ background: "white", borderColor: "#c8e6c9" }}>
            <div>
              <h2 className="text-xl font-black" style={{ color: "#014d1a" }}>Health Professionals</h2>
              <p className="text-sm mt-1" style={{ color: "#4caf50" }}>Add professionals to forward support tickets to.</p>
            </div>
            {isSuper && <button onClick={() => setAddingPro(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: "#027027" }}>
              <UserPlus size={16} /> Add Professional
            </button>}
          </div>

          {addingPro && (
            <form onSubmit={handleAddPro} className="p-6 rounded-2xl border shadow-sm space-y-4" style={{ background: "white", borderColor: "#c8e6c9" }}>
              <h3 className="font-bold" style={{ color: "#014d1a" }}>New Health Professional</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase block mb-1" style={{ color: "#027027" }}>Full Name</label>
                  <input required value={newPro.name} onChange={e => setNewPro({...newPro, name: e.target.value})} placeholder="Dr. Jane Smith" className="w-full rounded-xl px-4 py-2.5 border text-sm outline-none" style={{ background: "#f0f7f0", borderColor: "#c8e6c9" }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase block mb-1" style={{ color: "#027027" }}>Role</label>
                  <input required value={newPro.role} onChange={e => setNewPro({...newPro, role: e.target.value})} placeholder="e.g. Nutritionist, Pediatrician" className="w-full rounded-xl px-4 py-2.5 border text-sm outline-none" style={{ background: "#f0f7f0", borderColor: "#c8e6c9" }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase block mb-1" style={{ color: "#027027" }}>Email (Gmail)</label>
                  <input required type="email" value={newPro.email} onChange={e => setNewPro({...newPro, email: e.target.value})} placeholder="doctor@gmail.com" className="w-full rounded-xl px-4 py-2.5 border text-sm outline-none" style={{ background: "#f0f7f0", borderColor: "#c8e6c9" }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase block mb-1" style={{ color: "#027027" }}>Phone</label>
                  <input type="tel" value={newPro.phone} onChange={e => setNewPro({...newPro, phone: e.target.value})} placeholder="+256 700 000 000" className="w-full rounded-xl px-4 py-2.5 border text-sm outline-none" style={{ background: "#f0f7f0", borderColor: "#c8e6c9" }} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: "#027027" }}>Save Professional</button>
                <button type="button" onClick={() => setAddingPro(false)} className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 border border-gray-200">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionals.map(pro => (
              <div key={pro.id} className="p-5 rounded-2xl border shadow-sm flex flex-col gap-3" style={{ background: "white", borderColor: "#c8e6c9" }}>
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl" style={{ background: "#e8f5e9", color: "#027027" }}>
                    {pro.name[0]}
                  </div>
                  {isSuper && <button onClick={() => handleDeletePro(pro.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
                    <Trash2 size={15} />
                  </button>}
                </div>
                <div>
                  <p className="font-black text-gray-900">{pro.name}</p>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#e8f5e9", color: "#027027" }}>{pro.role}</span>
                </div>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2"><Mail size={13} style={{ color: "#027027" }} />{pro.email}</div>
                  {pro.phone && <div className="flex items-center gap-2"><Phone size={13} style={{ color: "#027027" }} />{pro.phone}</div>}
                </div>
              </div>
            ))}
            {professionals.length === 0 && !addingPro && (
              <div className="col-span-3 p-8 text-center rounded-2xl border" style={{ borderColor: "#c8e6c9", color: "#9e9e9e" }}>
                No health professionals added yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
