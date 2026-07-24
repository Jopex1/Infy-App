"use client";
import { useState, useEffect, useRef } from "react";
import { Edit, Mail, Phone, MapPin, Plus, User, Camera, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [kids, setKids] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newKid, setNewKid] = useState({ name: "", dob: "", gender: "Girl", weight: "", height: "", placeBirth: "", avatar: "" });
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "", phone: "", location: "", avatar: null });
  const fileRef = useRef();

  useEffect(() => {
    const stored = localStorage.getItem("infy_kids");
    if (stored) setKids(JSON.parse(stored));
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

  const saveKids = (updated) => {
    setKids(updated);
    localStorage.setItem("infy_kids", JSON.stringify(updated));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newKid.name || !newKid.dob) return;
    saveKids([...kids, { ...newKid, id: Date.now().toString(), vaccineRecords: [], weighingRecords: [] }]);
    setNewKid({ name: "", dob: "", gender: "Girl", weight: "", height: "", placeBirth: "", avatar: "" });
    setIsAdding(false);
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

  const KidForm = ({ onSubmit, title }) => (
    <form onSubmit={onSubmit} className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-300 relative">
      <button type="button" onClick={() => { setIsAdding(false); setEditingKidId(null); }}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
        <X size={16}/>
      </button>
      <h3 className="text-base font-bold text-[#027027] mb-1">{title}</h3>
      
      <div className="flex justify-center mb-2">
        <label className="relative cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-[#027027] overflow-hidden flex items-center justify-center shadow-sm">
            {newKid.avatar ? <img src={newKid.avatar} className="w-full h-full object-cover" alt="avatar" /> : <Camera size={20} className="text-[#027027]" />}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files[0];
            if (f) setNewKid({ ...newKid, avatar: URL.createObjectURL(f) });
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

      <button type="submit" className="w-full bg-[#027027] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
        <Save size={18} /> Save
      </button>
    </form>
  );

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
              <button key={kid.id} onClick={() => openEditKid(kid)}
                className="flex flex-col items-center gap-1.5 group">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${colors[idx % colors.length]} border-2 border-white shadow-md group-active:scale-95 transition overflow-hidden`}>
                  {kid.avatar ? (
                    <img src={kid.avatar} alt={kid.name} className="w-full h-full object-cover" />
                  ) : (
                    kid.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-[10px] uppercase text-gray-500 font-medium">{kid.name}</span>
              </button>
            );
          })}
        </div>

        <button onClick={() => setIsAdding(!isAdding)}
          className="w-full mt-6 flex items-center justify-center gap-2 text-sm text-[#027027] font-bold bg-green-50 border border-[#027027] py-3.5 rounded-2xl shadow-sm hover:bg-green-100 transition active:scale-95">
          <Plus size={18}/> Add Child
        </button>
      </div>

      {/* Add Kid Form */}
      {isAdding && <KidForm onSubmit={handleAdd} title="Register a Child" />}

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
