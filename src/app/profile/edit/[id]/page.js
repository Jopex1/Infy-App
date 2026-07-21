"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRef } from "react";
import { Save, ArrowLeft, Trash2, Camera, User } from "lucide-react";
import Link from "next/link";

export default function EditChildPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const fileRef = useRef(null);
  
  const [kids, setKids] = useState([]);
  const [kid, setKid] = useState({ name: "", dob: "", gender: "Girl", weight: "", height: "", placeBirth: "", avatar: null });

  useEffect(() => {
    const stored = localStorage.getItem("infy_kids");
    if (stored) {
      const parsedKids = JSON.parse(stored);
      setKids(parsedKids);
      const targetKid = parsedKids.find(k => k.id === id);
      if (targetKid) {
        setKid(targetKid);
      }
    }
  }, [id]);

  const handleUpdate = (e) => {
    e.preventDefault();
    const updatedKids = kids.map(k => k.id === id ? { ...k, ...kid } : k);
    localStorage.setItem("infy_kids", JSON.stringify(updatedKids));
    router.push("/profile");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this child's profile?")) {
      const updatedKids = kids.filter(k => k.id !== id);
      localStorage.setItem("infy_kids", JSON.stringify(updatedKids));
      router.push("/profile");
    }
  };

  const handleAvatarChange = (e) => {
    const f = e.target.files[0];
    if (f) setKid(prev => ({...prev, avatar: URL.createObjectURL(f)}));
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col pb-safe animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="bg-white border-b px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4 text-[#027027] p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-gray-900 text-lg">Edit Child Profile</h1>
      </header>

      <div className="p-4 mt-2">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-28 h-28 bg-[#d9d9d9] rounded-full overflow-hidden flex items-center justify-center shadow-sm">
              {kid.avatar ? (
                <img src={kid.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 bg-[#027027] text-white p-2 rounded-full shadow-md border-2 border-white">
              <Camera size={16} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>

        <form onSubmit={handleUpdate} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Full Name</label>
            <input required type="text" value={kid.name} onChange={e => setKid({...kid, name: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#027027] focus:ring-1 focus:ring-[#027027]" placeholder="Child's name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Date of Birth</label>
              <input required type="date" value={kid.dob} onChange={e => setKid({...kid, dob: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-[#027027] focus:ring-1 focus:ring-[#027027]" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Gender</label>
              <select value={kid.gender} onChange={e => setKid({...kid, gender: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-[#027027] focus:ring-1 focus:ring-[#027027] text-gray-700">
                <option>Girl</option>
                <option>Boy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Place of Birth</label>
            <input type="text" value={kid.placeBirth} onChange={e => setKid({...kid, placeBirth: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#027027] focus:ring-1 focus:ring-[#027027]" placeholder="Hospital / City" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Weight (kg)</label>
              <input type="number" step="0.1" value={kid.weight} onChange={e => setKid({...kid, weight: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-[#027027] focus:ring-1 focus:ring-[#027027]" placeholder="e.g. 3.5" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Height (cm)</label>
              <input type="number" step="0.1" value={kid.height} onChange={e => setKid({...kid, height: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-[#027027] focus:ring-1 focus:ring-[#027027]" placeholder="e.g. 50" />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="flex-1 bg-[#027027] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition text-sm">
              <Save size={18} /> Save Changes
            </button>
            <button type="button" onClick={handleDelete} className="bg-red-50 text-red-600 font-bold px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm border border-red-100 hover:bg-red-100 active:scale-95 transition">
              <Trash2 size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
