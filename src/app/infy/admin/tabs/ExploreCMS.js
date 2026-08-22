"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Plus, Trash2, Edit2, Video, GripVertical, Check } from "lucide-react";

export default function ExploreCMS() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "content_explore"));
      if (snap.empty) {
        // No data yet, could initialize here, but let's just show empty state
        setCategories([]);
      } else {
        const cats = snap.docs.map(d => {
          const category = { id: d.id, ...d.data() };
          if (category.title?.toLowerCase().includes("growth") || category.title?.toLowerCase().includes("development")) {
            category.image = "/images/growth and dev.jpeg";
          }
          return category;
        });
        // Sort by some order if available, else by title
        cats.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(cats);
      }
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInitDefaults = async () => {
    if (!confirm("This will upload the hardcoded defaults to Firestore. Continue?")) return;
    const defaultCategories = [
      { title: "Nutrition", icon: "🥗", image: "/images/thumbnails/nutrition.jpg.jpeg", color: "bg-orange-50 border-orange-200", iconBg: "bg-orange-100", videos: [{ id: "__Uc8HVve2A" }, { id: "c7Yr3KNnujs" }, { id: "SA_9qmMOR3U" }] },
      { title: "Vaccination", icon: "💉", image: "/images/thumbnails/vaccination.jpg", color: "bg-[#e8ece5] border-[#c0d1b6]", iconBg: "bg-green-100", videos: [{ id: "upcanlY0oNM" }, { id: "LRdoBofFcNs" }, { id: "kQWiSM-98MA" }] },
      { title: "Child Development", icon: "🧠", image: "/images/thumbnails/child development.jpg.jpeg", color: "bg-purple-50 border-purple-200", iconBg: "bg-purple-100", videos: [{ id: "UqYTOziVxXI" }, { id: "i3oAo0FSpn8" }, { id: "VVmMK4ZcPxY" }] },
      { title: "Newborn Care", icon: "👶", image: "/images/thumbnails/Newborn Care.jpeg", color: "bg-pink-50 border-pink-200", iconBg: "bg-pink-100", videos: [{ id: "Z_mY4-MNyFU" }, { id: "2vqhTU16Dr4" }, { id: "YfhWxMmBIW4" }] },
      { title: "Health and Wellness", icon: "❤️", image: "/images/thumbnails/health and wellness.jpg.jpeg", color: "bg-red-50 border-red-200", iconBg: "bg-red-100", videos: [{ id: "yQtehKRIHmE" }, { id: "u2UZS3KqeFs" }, { id: "yE7OMXkESLw" }] },
      { title: "Growth Milestone", icon: "📏", image: "/images/growth and dev.jpeg", color: "bg-blue-50 border-blue-200", iconBg: "bg-blue-100", videos: [{ id: "b2h7u45kqrI" }, { id: "3Bm9T8R2u2s" }] },
      { title: "Sleep and Rest", icon: "😴", image: "/images/thumbnails/Sleep and Rest .jpeg", color: "bg-indigo-50 border-indigo-200", iconBg: "bg-indigo-100", videos: [{ id: "VMmlO0-OPls" }, { id: "XknDPHgbTy0" }] },
      { title: "Safety and First Aid", icon: "🩹", image: "/images/thumbnails/Safety and First AId.jpeg", color: "bg-yellow-50 border-yellow-200", iconBg: "bg-yellow-100", videos: [{ id: "l9KoiK-Fnog" }, { id: "XknDPHgbTy0" }] },
      { title: "Hygiene and Care", icon: "🧼", image: "/images/thumbnails/Hygein and Care.jpg.jpeg", color: "bg-teal-50 border-teal-200", iconBg: "bg-teal-100", videos: [{ id: "YfhWxMmBIW4" }, { id: "c7Yr3KNnujs" }] },
      { title: "Learning and Play", icon: "🧩", image: "/images/thumbnails/Learning And Play.jpeg", color: "bg-emerald-50 border-emerald-200", iconBg: "bg-emerald-100", videos: [{ id: "i3oAo0FSpn8" }, { id: "VVmMK4ZcPxY" }] },
      { title: "Parenting", icon: "👨‍👩‍👧", image: "/images/thumbnails/Parenting.jpeg", color: "bg-fuchsia-50 border-fuchsia-200", iconBg: "bg-fuchsia-100", videos: [{ id: "yQtehKRIHmE" }, { id: "u2UZS3KqeFs" }] },
      { title: "Special Needs", icon: "🤝", image: "/images/thumbnails/special needs and support.jpeg", color: "bg-cyan-50 border-cyan-200", iconBg: "bg-cyan-100", videos: [{ id: "upcanlY0oNM" }, { id: "LRdoBofFcNs" }] },
    ];
    setLoading(true);
    let saved = 0;
    for (let i = 0; i < defaultCategories.length; i++) {
      try {
        await setDoc(doc(db, "content_explore", `cat_${i}`), { ...defaultCategories[i], order: i });
        saved++;
      } catch(err) {
        console.error(`Failed to save cat_${i}:`, err);
      }
    }
    alert(`Saved ${saved} of ${defaultCategories.length} categories.`);
    fetchCategories();
  };

  const saveCategory = async (cat) => {
    try {
      const ref = doc(db, "content_explore", cat.id);
      await updateDoc(ref, cat);
      setEditingCat(null);
      fetchCategories();
    } catch (err) {
      alert("Error saving category: " + err.message);
    }
  };

  const addVideo = (cat) => {
    const videoId = prompt("Enter YouTube Video ID (e.g., dQw4w9WgXcQ):");
    if (!videoId) return;
    const newCat = { ...cat, videos: [...cat.videos, { id: videoId }] };
    saveCategory(newCat);
  };

  const removeVideo = (cat, index) => {
    if (!confirm("Remove this video?")) return;
    const newCat = { ...cat, videos: cat.videos.filter((_, i) => i !== index) };
    saveCategory(newCat);
  };

  const deleteCategory = async (catId) => {
    if (!confirm("Are you sure you want to delete this entire category?")) return;
    await deleteDoc(doc(db, "content_explore", catId));
    fetchCategories();
  };

  if (loading) return <div className="text-gray-500">Loading CMS...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border" style={{ borderColor: '#c8e6c9' }}>
        <div>
          <h2 className="text-xl font-black" style={{ color: '#014d1a' }}>Explore Content</h2>
          <p className="text-sm mt-1" style={{ color: '#4caf50' }}>Manage video categories shown in the Explore tab.</p>
        </div>
        <button onClick={handleInitDefaults} className="text-white font-bold py-2 px-4 rounded-xl" style={{ background: '#027027' }}>
          Initialize Default Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className={`p-4 flex items-center gap-3 ${cat.color || 'bg-gray-50'} border-b`}>
              <div className={`${cat.iconBg || 'bg-white'} w-10 h-10 rounded-lg flex items-center justify-center text-xl`}>
                {cat.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 leading-tight">{cat.title}</h3>
                <p className="text-xs text-gray-500">{cat.videos?.length || 0} videos</p>
              </div>
              <button onClick={() => deleteCategory(cat.id)} className="text-red-400 hover:text-red-600 p-1 bg-white/50 rounded">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="p-4 flex-1 space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Videos in Category</h4>
              {cat.videos?.map((v, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <span className="text-xs font-mono text-gray-600">{v.id}</span>
                  <button onClick={() => removeVideo(cat, i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => addVideo(cat)} className="w-full mt-2 border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition">
                <Plus size={14} /> Add Video ID
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
