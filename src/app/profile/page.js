"use client";
import { useState, useEffect, useRef } from "react";
import { Edit, Mail, Phone, MapPin, Plus, User, Camera, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChildren } from "@/hooks/useChildren";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Profile() {
  const router = useRouter();
  const { kids, addChild, deleteChild } = useChildren();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newKid, setNewKid] = useState({ name: "", dob: "", gender: "Girl", weight: "", height: "", placeBirth: "", avatar: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteKid, setDeleteKid] = useState(null);
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "", phone: "", location: "", avatar: null });
  const fileRef = useRef();
  const holdTimer = useRef(null);

  const startKidHold = (kid) => {
    holdTimer.current = setTimeout(() => setDeleteKid(kid), 3000);
  };

  const cancelKidHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("infy_user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email || "",
        phone: u.phone || "",
        location: u.location || "",
        avatar: u.avatar || null,
      });
    } else {
      router.push("/onboarding");
    }
  }, [router]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newKid.name || !newKid.dob) return;
    setSaving(true);
    try {
      // Fire and forget so UI feels snappy
      addChild(
        {
          name: newKid.name,
          dob: newKid.dob,
          gender: newKid.gender,
          weight: newKid.weight,
          height: newKid.height,
          placeBirth: newKid.placeBirth,
          avatar: newKid.avatar,
        },
        avatarFile
      ).catch(console.error);

      setSaving(false);
      setSaveSuccess(newKid.name);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsAdding(false);
        setNewKid({ name: "", dob: "", gender: "Girl", weight: "", height: "", placeBirth: "", avatar: "" });
        setAvatarFile(null);
      }, 2000);
    } catch (err) {
      setSaving(false);
      alert("Failed to save. Please try again.");
    }
  };

  const handleSaveProfile = () => {
    const stored = localStorage.getItem("infy_user");
    const existing = stored ? JSON.parse(stored) : {};
    localStorage.setItem("infy_user", JSON.stringify({ ...existing, ...user }));
    setEditingProfile(false);
  };

  const openEditKid = (kid) => {
    router.push(`/profile/edit/${kid.id}`);
  };



  return (
    <div className="px-6 space-y-5 pb-safe animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">

      {/* Profile Header */}
      <div className="flex flex-col items-center mt-4">
        <div className="relative mb-3">
          <div className="w-28 h-28 bg-[#d9d9d9] rounded-full overflow-hidden">
            {user.avatar
              ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><User size={40} className="text-gray-400"/></div>
            }
          </div>
          {editingProfile && (
            <button onClick={() => fileRef.current.click()}
              className="absolute -bottom-2 -right-2 bg-[#027027] text-white rounded-full p-1.5 shadow border-2 border-white">
              <Camera size={14}/>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => {
              const f = e.target.files[0];
              if (f) setUser(prev => ({...prev, avatar: URL.createObjectURL(f)}));
            }} />
        </div>

        {editingProfile ? (
          <div className="flex flex-col gap-2 w-full mt-2">
            <div className="grid grid-cols-2 gap-2">
              <input value={user.firstName} onChange={e => setUser({...user, firstName: e.target.value})}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#027027]" placeholder="First Name"/>
              <input value={user.lastName} onChange={e => setUser({...user, lastName: e.target.value})}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#027027]" placeholder="Last Name"/>
            </div>
            <input value={user.phone} onChange={e => setUser({...user, phone: e.target.value})}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#027027]" placeholder="Phone"/>
            <input value={user.location} onChange={e => setUser({...user, location: e.target.value})}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#027027]" placeholder="Location"/>
            <button onClick={handleSaveProfile}
              className="bg-[#027027] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition text-sm">
              <Save size={16}/> Save Profile
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800">{user.firstName} {user.lastName}</h2>
            <button onClick={() => setEditingProfile(true)} className="text-[#027027]"><Edit size={15}/></button>
          </div>
        )}
      </div>

      <hr className="border-[#027027]/20" />

      {/* Kids Row */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[#027027]">My Children</h3>
        </div>

        <div className="flex gap-4 flex-wrap">
          {kids.map((kid, idx) => {
            const colors = ["bg-orange-100 text-orange-600", "bg-blue-100 text-blue-600", "bg-pink-100 text-pink-600", "bg-purple-100 text-purple-600"];
            return (
              <button key={kid.id} onClick={() => openEditKid(kid)} onPointerDown={() => startKidHold(kid)} onPointerUp={cancelKidHold} onPointerLeave={cancelKidHold} onPointerCancel={cancelKidHold}
                className="flex flex-col items-center gap-1.5 group">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${colors[idx % colors.length]} border-2 border-white shadow-md group-active:scale-95 transition overflow-hidden`}>
                  {kid.avatar ? (
                    <img src={kid.avatar} alt={kid.name} className="w-full h-full object-cover" />
                  ) : (
                    kid.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-[10px] uppercase text-gray-500 font-medium">{kid.name}</span>
                {kid.createdAt && <span className="text-[9px] text-gray-400">Added {new Date(kid.createdAt).toLocaleDateString()}</span>}
              </button>
            );
          })}
        </div>

        <button onClick={() => setIsAdding(!isAdding)}
          className="w-full mt-6 flex items-center justify-center gap-2 text-sm text-[#027027] font-bold bg-green-50 border border-[#027027] py-3.5 rounded-2xl shadow-sm hover:bg-green-100 transition active:scale-95">
          <Plus size={18}/> Add Child
        </button>
      </div>

      {deleteKid && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-5" onClick={() => setDeleteKid(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-900">Delete {deleteKid.name}?</h3>
            <p className="text-sm text-gray-500 mt-2">This child profile and its records will be removed.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteKid(null)} className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600">Cancel</button>
              <button onClick={async () => { await deleteChild(deleteKid.id); setDeleteKid(null); }} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Kid Form */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] relative" style={{ scrollbarWidth: 'none' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#027027]">Register a Child</h3>
              <button type="button" onClick={() => { setIsAdding(false); setAvatarFile(null); }} className="text-gray-400 bg-gray-100 rounded-full p-1.5 hover:bg-gray-200"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="flex justify-center mb-2">
                <label className="relative cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-[#027027] overflow-hidden flex items-center justify-center shadow-sm">
                    {newKid.avatar ? <img src={newKid.avatar} className="w-full h-full object-cover" alt="avatar" /> : <Camera size={24} className="text-[#027027]" />}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files[0];
                    if (f) {
                      setAvatarFile(f);
                      setNewKid({ ...newKid, avatar: URL.createObjectURL(f) });
                    }
                  }} />
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-0.5 block">Full Name</label>
                <input required type="text" value={newKid.name} onChange={e => setNewKid({...newKid, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" placeholder="Child's name" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-0.5 block">Date of Birth</label>
                  <input required type="date" value={newKid.dob} onChange={e => setNewKid({...newKid, dob: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-0.5 block">Gender</label>
                  <select value={newKid.gender} onChange={e => setNewKid({...newKid, gender: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#027027] text-sm text-gray-700">
                    <option>Girl</option>
                    <option>Boy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-0.5 block">Place of Birth</label>
                <input type="text" value={newKid.placeBirth} onChange={e => setNewKid({...newKid, placeBirth: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" placeholder="Hospital / City" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-0.5 block">Weight (kg)</label>
                  <input type="number" step="0.1" value={newKid.weight} onChange={e => setNewKid({...newKid, weight: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#027027] text-sm" placeholder="e.g. 3.5" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-0.5 block">Height (cm)</label>
                  <input type="number" step="0.1" value={newKid.height} onChange={e => setNewKid({...newKid, height: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#027027] text-sm" placeholder="e.g. 50" />
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full mt-2 bg-[#027027] disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
                <Save size={18} /> {saving ? "Saving..." : "Save Child Profile"}
              </button>
            </form>

            {/* Success Overlay */}
            {saveSuccess && (
              <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                <div className="w-56 h-56 -mt-8 mb-2">
                  <DotLottieReact src="/Success.lottie" loop={false} autoplay />
                </div>
                <h3 className="text-2xl font-black text-[#027027] mb-2">Child Added!</h3>
                <p className="text-sm text-gray-500">{saveSuccess} successfully added.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Info Box */}
      <div className="border border-[#027027]/30 rounded-3xl p-5 bg-white space-y-4 shadow-sm">
        {[
          { icon: <Mail className="text-[#027027]" size={20}/>, label: "Email", value: user.email },
          { icon: <Phone className="text-[#027027]" size={20}/>, label: "Phone", value: user.phone },
          { icon: <MapPin className="text-[#027027]" size={20}/>, label: "Location", value: user.location },
        ].map((item, i, arr) => (
          <div key={i} className={`flex items-center gap-4 ${i < arr.length - 1 ? "border-b border-gray-100 pb-4" : ""}`}>
            {item.icon}
            <div>
              <span className="block text-xs font-bold text-[#027027]">{item.label}</span>
              <span className="block text-xs text-gray-500">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
