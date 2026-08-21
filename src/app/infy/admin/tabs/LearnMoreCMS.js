"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { Save, Edit2, X } from "lucide-react";

export default function LearnMoreCMS() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { id, title, description, link }

  const fetchSections = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "content_learn_more"));
      if (snap.empty) {
        setSections([]);
      } else {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSections(data);
      }
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleInitDefaults = async () => {
    if (!confirm("Initialize default Learn More content?")) return;
    const defaultSections = [
      {
        id: "newborn",
        title: "👶 NEWBORN STAGE\nBirth to 3 months",
        description: "Babies spend most of their time sleeping and feeding. They begin recognising familiar voices and faces, responding to sounds and touch, and slowly developing control over their movements...",
        fullDescription: "During the first three months, babies are adjusting to life outside the womb. They need frequent feeding, plenty of sleep and close care from parents or caregivers...",
        link: "https://www.unicef.org/parenting/child-care/newborn-care",
        order: 1
      },
      {
        id: "infant",
        title: "🍼 INFANT STAGE\n4 to 11 months",
        description: "Your baby is becoming much more active! They will start rolling over, sitting up and maybe even crawling. They will also begin eating solid foods and communicating through babbles and gestures...",
        fullDescription: "At this stage, babies need plenty of interaction. Talking, reading and playing together helps their brain develop. As they start moving more, it’s important to create a safe space for them to explore...",
        link: "https://www.unicef.org/parenting/child-care/infant-care",
        order: 2
      },
      {
        id: "toddler",
        title: "🏃 TODDLER STAGE\n1 to 3 years",
        description: "Toddlers are curious and full of energy! They are learning to walk, talk and do things on their own. This is a time of rapid learning, but also a time when they start expressing strong emotions and testing limits...",
        fullDescription: "Toddlers thrive on routine and clear boundaries. Give them safe ways to explore and encourage their independence by letting them help with simple tasks...",
        link: "https://www.unicef.org/parenting/child-care/toddler-care",
        order: 3
      }
    ];
    setLoading(true);
    for (const sec of defaultSections) {
      await setDoc(doc(db, "content_learn_more", sec.id), sec);
    }
    fetchSections();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(db, "content_learn_more", editing.id);
      await updateDoc(ref, {
        title: editing.title,
        description: editing.description,
        fullDescription: editing.fullDescription,
        link: editing.link
      });
      setEditing(null);
      fetchSections();
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  if (loading) return <div className="text-gray-500">Loading CMS...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-black text-gray-900">Learn More Content</h2>
          <p className="text-sm text-gray-500">Edit text and links for the Learn More articles.</p>
        </div>
        {sections.length === 0 && (
          <button onClick={handleInitDefaults} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl">
            Initialize Default Data
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sections.map(sec => (
          <div key={sec.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {editing?.id === sec.id ? (
              <form onSubmit={handleSave} className="p-6 space-y-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-900">Editing Section</h3>
                  <button type="button" onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Title</label>
                  <textarea rows={2} value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Short Description</label>
                  <textarea rows={3} value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Full Description (Read More)</label>
                  <textarea rows={4} value={editing.fullDescription} onChange={e => setEditing({...editing, fullDescription: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">UNICEF Link</label>
                  <input type="url" value={editing.link} onChange={e => setEditing({...editing, link: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#027027] text-sm" />
                </div>
                <button type="submit" className="bg-[#027027] hover:bg-green-800 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2">
                  <Save size={18} /> Save Changes
                </button>
              </form>
            ) : (
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <h3 className="font-black text-gray-900 whitespace-pre-line">{sec.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{sec.description}</p>
                  <a href={sec.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">{sec.link}</a>
                </div>
                <div className="shrink-0 flex items-start">
                  <button onClick={() => setEditing(sec)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition">
                    <Edit2 size={16} /> Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
