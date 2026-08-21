"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Trash2, UserPlus } from "lucide-react";

// Hash function matching login
const hashPassword = async (str) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
};

export default function AdminsTab() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "admins"));
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.password) return;
    try {
      const passwordHash = await hashPassword(newAdmin.password);
      await addDoc(collection(db, "admins"), {
        username: newAdmin.username,
        passwordHash,
        createdAt: new Date().toISOString()
      });
      setNewAdmin({ username: "", password: "" });
      fetchAdmins();
    } catch(err) {
      alert("Error adding admin: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this admin?")) return;
    try {
      await deleteDoc(doc(db, "admins", id));
      fetchAdmins();
    } catch(err) {
      alert("Error deleting admin");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-green-600" /> Create Sub-Admin
        </h3>
        <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Username</label>
            <input required type="text" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#027027]" placeholder="e.g. nurse_jane" />
          </div>
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Password</label>
            <input required type="text" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#027027]" placeholder="Assign a secure password" />
          </div>
          <button type="submit" className="bg-[#027027] hover:bg-green-800 text-white font-bold py-2 px-6 rounded-xl shadow-md transition whitespace-nowrap h-10 w-full sm:w-auto">
            Create Admin
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4">They will log in using infysupport5@gmail.com and the credentials above.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Current Sub-Admins ({admins.length})</h3>
        {loading ? <p className="text-gray-500">Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                <tr>
                  <th className="p-3 rounded-tl-lg">Username</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 text-right rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-semibold text-gray-800">{admin.username}</td>
                    <td className="p-3 text-gray-500">{new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDelete(admin.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-gray-400">No sub-admins found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
