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
        description: "Babies spend most of their time sleeping and feeding. They begin recognising familiar voices and faces, responding to sounds and touch, and slowly developing control over their movements.",
        fullDescription: "During the first three months, babies are adjusting to life outside the womb. They need frequent feeding, plenty of sleep and close care from parents or caregivers.\n\nBabies develop at different speeds, so parents should focus on their child's progress rather than comparing them with other babies. Talking, singing, smiling and holding the baby can support early learning and bonding.",
        videos: [
          { id: "oh-W8riFF5w", title: "Newborn Care", description: "Learn important newborn care practices that help keep a baby healthy, safe and comfortable during the first months of life." },
          { id: "i0tqQfTpVDc", title: "Maximising Breastmilk", description: "Learn about breastfeeding support, proper positioning, attachment and skin-to-skin contact to help mothers breastfeed successfully." },
          { id: "JvmTlvBUhuQ", title: "Your Baby's Early Development", description: "Learn about your newborn's early development and simple ways to interact with your baby to support learning and healthy development." },
        ],
        sections: [
          {
            title: "Feeding & Breastfeeding",
            short: "Breast milk provides important nutrition for newborn babies. Feed the baby regularly and respond to signs that the baby is hungry.",
            full: "For the first 6 months, breast milk is recommended as the baby's main food and drink. A baby may show hunger by moving their mouth, turning towards the breast, sucking their hands or becoming more active.\n\nTry to make sure the baby is properly positioned and attached during breastfeeding. If breastfeeding is painful or the baby is having difficulty feeding, speak with a health worker.\n\nAvoid giving the newborn foods or drinks that are not recommended for their age unless advised by a qualified health professional.",
          },
          {
            title: "Sleep & Safe Sleeping",
            short: "Newborns sleep for many hours, but their sleep usually happens in short periods because they need to feed often.",
            full: "Newborns do not usually have a regular day-and-night sleep pattern. They may sleep for a short time, wake to feed and then go back to sleep.\n\nAlways place the baby on their back when putting them to sleep. Keep the sleeping area firm, clean and free from loose pillows, blankets, toys and other objects that could cover the baby's face.\n\nA calm environment at night can help the baby gradually learn the difference between daytime and nighttime.",
          },
          {
            title: "Baby Development",
            short: "Newborns begin learning from birth. They slowly become more alert, recognise familiar people and respond to sounds and touch.",
            full: "Talk and sing to the baby regularly. Smile at them, make eye contact and respond to their sounds.\n\nGive the baby safe opportunities to move their arms and legs while supervised. Simple activities such as talking during feeding, singing during bathing and holding the baby can support early communication and bonding.\n\nDo not worry if your baby does not develop exactly like another baby. Children develop at different speeds.",
          },
          {
            title: "Newborn Warning Signs",
            short: "Newborns can become sick quickly. Parents should know the signs that may require urgent medical attention.",
            full: "Seek medical help if the baby has difficulty breathing, is not feeding properly, is unusually weak or difficult to wake, has convulsions, has repeated vomiting or develops a serious fever.\n\nAlso seek help if the baby appears very unwell or if you notice a major change in their normal behaviour.\n\nIf you are worried about a newborn, do not wait for the condition to become worse. Contact a qualified health worker or health facility.",
          },
        ],
        order: 1
      },
      {
        id: "infant",
        title: "🍼 INFANT STAGE\n4 to 11 months",
        description: "Your baby is becoming much more active! They will start rolling over, sitting up and maybe even crawling. They will also begin eating solid foods and communicating through babbles and gestures.",
        fullDescription: "At this stage, babies need plenty of interaction. Talking, reading and playing together helps their brain develop. As they start moving more, it’s important to create a safe space for them to explore.",
        videos: [
          { id: "zZk9yQrWdAg", title: "Tips on How to Feed Your Baby from 6 to 12 Months", description: "Learn how to introduce nutritious foods, continue breastfeeding and support your baby's growth through healthy feeding." },
          { id: "T5LoDnzigJs", title: "Baby Development Through Play", description: "Learn how talking, playing and responding to your baby can support brain development, communication and early learning." },
          { id: "YD-f1iWkvhw", title: "Infant Development and Learning", description: "Learn about important developmental changes during the first year and simple activities caregivers can use to support their baby's development." },
        ],
        sections: [
          {
            title: "Feeding & New Foods",
            short: "Around 6 months, babies can begin eating appropriate complementary foods while breastfeeding continues.",
            full: "Start with small amounts of suitable foods and gradually increase the amount and variety as the baby grows.\n\nOffer a variety of nutritious foods such as vegetables, fruits, eggs, fish, meat, beans and other suitable family foods.\n\nFeed the child patiently and encourage them without forcing them to eat. Prepare food safely and keep feeding utensils clean.\n\nContinue breastfeeding while introducing complementary foods.",
          },
          {
            title: "Growth & Weight",
            short: "Regular growth monitoring helps parents and health workers understand how the child is growing and developing.",
            full: "During health visits, the child's weight, length or height and other measurements may be checked.\n\nKeep the child's growth records and health-card information safe. If a health worker gives a next growth-monitoring date, record it in Infy so the app can remind you.\n\nIf you notice that your child is not gaining weight or seems to be growing differently from expected, discuss it with a health worker.",
          },
          {
            title: "Learning Through Play",
            short: "Babies learn through simple activities such as talking, singing, playing and exploring safe objects.",
            full: "Talk to your baby throughout the day and respond when they make sounds. Sing songs, read picture books and play simple games.\n\nGive the baby safe objects that they can hold, look at and explore. Always supervise the baby during play.\n\nThese simple activities help babies develop communication, movement, thinking and social skills.\n\nYou do not need expensive toys. Everyday interaction with a caring adult is an important part of learning.",
          },
          {
            title: "Movement & Milestones",
            short: "During this stage, babies gradually develop better control of their bodies and may begin sitting, crawling, standing or moving around.",
            full: "Every baby develops at a different speed. Some babies may sit earlier, while others may take more time.\n\nGive your baby safe opportunities to move and explore. Allow them to practise reaching, rolling, sitting and moving while you supervise them.\n\nPay attention to the skills your child is gaining over time. If your child loses a skill they previously had or you have concerns about their development, speak with a health worker.",
          },
          {
            title: "Vaccinations & Health Visits",
            short: "Vaccinations and regular health visits help protect your child and allow health workers to monitor their growth and development.",
            full: "Keep the child's health card safe and follow the vaccination schedule provided by your health facility.\n\nInfy can help remind parents about upcoming vaccinations, growth monitoring, Vitamin A and other scheduled activities.\n\nIf a health worker gives a different next appointment date, enter that date into Infy. The app should then use that date for the next reminder.\n\nDo not ignore a missed appointment. Record the actual visit when the child eventually receives the service.",
          },
        ],
        order: 2
      },
      {
        id: "toddler",
        title: "🏃 TODDLER STAGE\n1 to 3 years",
        description: "Toddlers are curious and full of energy! They are learning to walk, talk and do things on their own. This is a time of rapid learning, but also a time when they start expressing strong emotions and testing limits.",
        fullDescription: "Toddlers thrive on routine and clear boundaries. Give them safe ways to explore and encourage their independence by letting them help with simple tasks.",
        videos: [
          { id: "1vYm3G5v3Dk", title: "Toddler Development", description: "Learn how to support a toddler's learning through safe exploration." },
          { id: "mJbPtEuHqFk", title: "Positive Parenting", description: "Learn effective positive parenting strategies for toddlers." },
          { id: "XknDPHgbTy0", title: "Toddler Safety", description: "Learn how to keep your toddler safe at home." },
        ],
        sections: [
          {
            title: "Nutrition & Healthy Eating",
            short: "Toddlers need a variety of nutritious foods to support their growing bodies and developing brains.",
            full: "Offer different types of nutritious foods, including vegetables, fruits, eggs, fish, meat, beans, grains and other healthy family foods suitable for the child.\n\nAllow the child to practise eating independently when it is safe. Toddlers may sometimes refuse food or become selective about what they eat.\n\nContinue offering healthy foods without forcing the child to eat. Eating together as a family can also help children learn healthy eating habits.",
          },
          {
            title: "Speech & Language",
            short: "Toddlers are learning new words and ways to communicate. Talking and listening to them every day helps support language development.",
            full: "Talk to your child about what you are doing and name objects around them.\n\nRead simple books, sing songs and encourage the child to repeat sounds and words.\n\nGive the child time to respond when you speak to them. Listen to what they are trying to communicate, even when their words are not yet clear.\n\nIf you are concerned about your child's hearing, speech or communication, discuss it with a health worker.",
          },
          {
            title: "Play & Learning",
            short: "Play helps toddlers learn how to think, communicate, solve simple problems and interact with other people.",
            full: "Give children opportunities to play, explore and try new things safely.\n\nSimple activities such as building with blocks, drawing, looking at picture books, singing, dancing and sorting objects can support learning.\n\nTalk to the child during play and ask simple questions. Encourage them to explore rather than doing everything for them.\n\nPlay does not always need expensive toys. Safe household objects and everyday activities can also become learning opportunities.",
          },
          {
            title: "Safety at Home",
            short: "As toddlers become more active, they can reach and explore places they could not reach before. Parents should make the home safer for them.",
            full: "Keep medicines, chemicals, sharp objects and other dangerous items out of the child's reach.\n\nWatch children closely around water, cooking areas, electrical outlets, stairs and roads.\n\nUse age-appropriate safety measures and teach the child simple safety rules as they grow.\n\nToddlers are naturally curious, so a safe environment allows them to explore while reducing the risk of injury.",
          },
          {
            title: "Behaviour & Independence",
            short: "Toddlers are learning to become independent and may sometimes become frustrated when they cannot get what they want.",
            full: "Toddlers are still learning how to understand and control their emotions. They may cry, become angry or have tantrums when they are tired, hungry or frustrated.\n\nStay calm and help the child understand what they are feeling. Give simple choices when possible, such as choosing between two suitable clothes or foods.\n\nPraise positive behaviour and set simple, consistent limits.\n\nAllow the child to practise safe tasks such as helping to put toys away, washing their hands or trying to eat independently.",
          },
          {
            title: "When to See a Doctor",
            short: "Regular health visits remain important as toddlers continue to grow and develop. Parents should also know when to seek medical help.",
            full: "Speak with a health worker if you have concerns about the child's growth, feeding, speech, hearing, vision, movement or behaviour.\n\nIf the child loses a skill they previously had, discuss it with a health professional.\n\nSeek urgent medical help if the child has difficulty breathing, has convulsions, becomes unusually weak or difficult to wake, has severe dehydration, or appears seriously ill.\n\nWhen you are unsure about a health problem, it is better to ask a qualified health worker for advice.",
          },
        ],
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
        videos: editing.videos || [],
        sections: editing.sections || []
      });
      setEditing(null);
      fetchSections();
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  const addVideoToEditing = () => {
    setEditing({
      ...editing,
      videos: [...(editing.videos || []), { id: "", title: "", description: "" }]
    });
  };

  const removeVideoFromEditing = (index) => {
    const newVideos = [...(editing.videos || [])];
    newVideos.splice(index, 1);
    setEditing({ ...editing, videos: newVideos });
  };

  const updateEditingVideo = (index, field, value) => {
    const newVideos = [...(editing.videos || [])];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setEditing({ ...editing, videos: newVideos });
  };

  const addSectionToEditing = () => {
    setEditing({
      ...editing,
      sections: [...(editing.sections || []), { title: "", short: "", full: "" }]
    });
  };

  const removeSectionFromEditing = (index) => {
    const newSections = [...(editing.sections || [])];
    newSections.splice(index, 1);
    setEditing({ ...editing, sections: newSections });
  };

  const updateEditingSection = (index, field, value) => {
    const newSections = [...(editing.sections || [])];
    newSections[index] = { ...newSections[index], [field]: value };
    setEditing({ ...editing, sections: newSections });
  };

  if (loading) return <div className="text-gray-500">Loading CMS...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border" style={{ borderColor: '#c8e6c9' }}>
        <div>
          <h2 className="text-xl font-black" style={{ color: '#014d1a' }}>Learn More Content</h2>
          <p className="text-sm mt-1" style={{ color: '#4caf50' }}>Edit text and links for the Learn More articles.</p>
        </div>
        <button onClick={handleInitDefaults} className="text-white font-bold py-2 px-4 rounded-xl" style={{ background: '#027027' }}>
          Initialize Default Data
        </button>
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
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-400 uppercase block">Videos / Links</label>
                    <button type="button" onClick={addVideoToEditing} className="text-xs text-[#027027] font-bold">+ Add Video</button>
                  </div>
                  <div className="space-y-3">
                    {(editing.videos || []).map((v, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 relative">
                        <button type="button" onClick={() => removeVideoFromEditing(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X size={16}/></button>
                        <input type="text" placeholder="YouTube Video ID" value={v.id} onChange={e => updateEditingVideo(i, 'id', e.target.value)} className="w-full text-sm mb-2 border-b border-gray-100 outline-none px-1 py-1 font-mono" />
                        <input type="text" placeholder="Video Title" value={v.title} onChange={e => updateEditingVideo(i, 'title', e.target.value)} className="w-full text-sm mb-2 border-b border-gray-100 outline-none px-1 py-1 font-bold" />
                        <textarea rows={2} placeholder="Video Description" value={v.description} onChange={e => updateEditingVideo(i, 'description', e.target.value)} className="w-full text-xs border-b border-gray-100 outline-none px-1 py-1 resize-none text-gray-600" />
                      </div>
                    ))}
                    {(editing.videos || []).length === 0 && <p className="text-xs text-gray-400 italic">No videos added yet.</p>}
                  </div>
                </div>

                {/* Key Information Sections */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-400 uppercase block">Key Information Sections (Accordions)</label>
                    <button type="button" onClick={addSectionToEditing} className="text-xs text-[#027027] font-bold">+ Add Section</button>
                  </div>
                  <div className="space-y-3">
                    {(editing.sections || []).map((s, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-gray-200 relative">
                        <button type="button" onClick={() => removeSectionFromEditing(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X size={16}/></button>
                        <input type="text" placeholder="Section Title (e.g. Feeding & Breastfeeding)" value={s.title} onChange={e => updateEditingSection(i, 'title', e.target.value)} className="w-full text-sm mb-2 border-b border-gray-100 outline-none px-1 py-1 font-bold text-[#027027]" />
                        <textarea rows={2} placeholder="Short Summary" value={s.short} onChange={e => updateEditingSection(i, 'short', e.target.value)} className="w-full text-xs mb-2 border-b border-gray-100 outline-none px-1 py-1 resize-none text-gray-600" />
                        <textarea rows={4} placeholder="Full Details (shown when expanded)" value={s.full} onChange={e => updateEditingSection(i, 'full', e.target.value)} className="w-full text-xs border-b border-gray-100 outline-none px-1 py-1 resize-none text-gray-800" />
                      </div>
                    ))}
                    {(editing.sections || []).length === 0 && <p className="text-xs text-gray-400 italic">No sections added yet.</p>}
                  </div>
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
                  <p className="text-xs font-bold text-[#027027]">
                    {(sec.videos || []).length} videos • {(sec.sections || []).length} key info sections
                  </p>
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
