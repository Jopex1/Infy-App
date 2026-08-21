"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { Edit2, Plus, Save, Trash2, X } from "lucide-react";

const emptyCarousel = { title: "", desc: "", link: "", color: "#027027", order: 0 };
const defaultCarousel = [
  { title: "Tummy Time", desc: "Start tummy time early. Even 3–5 minutes a day helps strengthen neck and shoulder muscles.", link: "https://raisingchildren.net.au/newborns/play-learning/play-ideas/tummy-time", color: "#027027" },
  { title: "Sleep Routine", desc: "Establish a consistent bedtime routine. Bath, book, and bed can work wonders.", link: "https://raisingchildren.net.au/newborns/sleep/settling-routines/newborn-sleep-routines", color: "#1d4ed8" },
  { title: "Nutritional Needs", desc: "Breastmilk or formula provides all the nutrients a child needs for the first 6 months.", link: "https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding", color: "#b45309" },
  { title: "Language Skills", desc: "Talk, read, and sing to your baby constantly to build their vocabulary.", link: "https://raisingchildren.net.au/babies/development/language-development/language-3-12-months", color: "#6b21a8" },
  { title: "Vaccination", desc: "Keep track of scheduled immunizations. They are critical for your baby's immune defense.", link: "https://www.cdc.gov/vaccines/by-age/index.html", color: "#9f1239" },
  { title: "Motor Skills", desc: "Provide safe objects to grasp to improve hand-eye coordination.", link: "https://www.unicef.org/parenting/child-development/baby-milestones-your-child-active-play", color: "#027027" },
  { title: "Teething Relief", desc: "A cold teething ring can soothe sore gums when those first teeth emerge.", link: "https://www.texaschildrens.org/content/wellness/teething-tips-new-information-parents", color: "#1d4ed8" },
  { title: "Solid Foods", desc: "Introduce solids one at a time to monitor for any potential allergies.", link: "https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/", color: "#b45309" },
  { title: "Baby Proofing", desc: "Cover sharp edges and secure cabinets before your baby starts crawling.", link: "https://www.unicef.org/parenting/safety/how-to-babyproof-your-home", color: "#6b21a8" },
  { title: "Self Care", desc: "Don't forget to take care of yourself. A rested parent is a happy parent!", link: "https://www.unicef.org/parenting/mental-health/parent-self-care-tips", color: "#9f1239" },
];

export default function CarouselCMS() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "content_carousel"));
      const data = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setItems(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const saveItem = async (event) => {
    event.preventDefault();
    if (!editing.title.trim() || !editing.desc.trim()) return;

    try {
      const payload = {
        title: editing.title.trim(),
        desc: editing.desc.trim(),
        link: editing.link.trim(),
        color: editing.color || "#027027",
        order: Number(editing.order) || 0,
      };
      if (editing.id) {
        await updateDoc(doc(db, "content_carousel", editing.id), payload);
      } else {
        await addDoc(collection(db, "content_carousel"), payload);
      }
      setEditing(null);
      fetchItems();
    } catch (error) {
      alert("Error saving carousel card: " + error.message);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm("Delete this carousel card?")) return;
    await deleteDoc(doc(db, "content_carousel", id));
    fetchItems();
  };

  const initializeDefaults = async () => {
    if (!confirm("Add the default home carousel cards?")) return;
    setLoading(true);
    try {
      await Promise.all(defaultCarousel.map((item, order) => addDoc(collection(db, "content_carousel"), { ...item, order })));
      await fetchItems();
    } catch (error) {
      alert("Error initializing carousel: " + error.message);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading CMS...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-green-200">
        <div>
          <h2 className="text-xl font-black text-[#014d1a]">Home Carousel</h2>
          <p className="text-sm mt-1 text-green-600">Manage the cards, links and colors shown on the home page.</p>
        </div>
        <div className="flex items-center gap-2">
          {items.length === 0 && <button type="button" onClick={initializeDefaults} className="bg-white border border-green-200 text-[#027027] font-bold py-2 px-3 rounded-xl text-xs">Initialize Defaults</button>}
          <button type="button" onClick={() => setEditing({ ...emptyCarousel, order: items.length })} className="bg-[#027027] text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2">
            <Plus size={17} /> Add Card
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={saveItem} className="bg-gray-50 border border-green-200 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900">{editing.id ? "Edit Carousel Card" : "Add Carousel Card"}</h3>
            <button type="button" onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
          </div>
          <input required value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} placeholder="Card title" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#027027]" />
          <textarea required rows={3} value={editing.desc} onChange={(event) => setEditing({ ...editing, desc: event.target.value })} placeholder="Card content" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#027027]" />
          <input type="url" value={editing.link} onChange={(event) => setEditing({ ...editing, link: event.target.value })} placeholder="Link (https://...)" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#027027]" />
          <div className="grid grid-cols-2 gap-3">
            <label className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
              Color
              <input type="color" value={editing.color} onChange={(event) => setEditing({ ...editing, color: event.target.value })} className="h-8 w-full cursor-pointer" />
            </label>
            <input type="number" value={editing.order} onChange={(event) => setEditing({ ...editing, order: event.target.value })} placeholder="Order" className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#027027]" />
          </div>
          <button type="submit" className="bg-[#027027] text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2"><Save size={17} /> Save Card</button>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-4 h-14 rounded-full shrink-0" style={{ backgroundColor: item.color || "#027027" }} />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{item.desc}</p>
              {item.link && <p className="text-xs text-blue-600 truncate mt-1">{item.link}</p>}
            </div>
            <button type="button" onClick={() => setEditing({ ...emptyCarousel, ...item })} className="text-gray-500 hover:text-[#027027] p-2"><Edit2 size={17} /></button>
            <button type="button" onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={17} /></button>
          </div>
        ))}
        {items.length === 0 && <div className="p-8 text-center border border-dashed border-gray-300 rounded-2xl text-sm text-gray-400">No carousel cards yet.</div>}
      </div>
    </div>
  );
}
