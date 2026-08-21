"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { Calendar, Activity, Footprints, CheckCircle, AlertCircle, Save, X, Syringe, User, Camera, Pill, TestTube, History, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { computeChildHealthSummary, getDaysRemaining } from "../../lib/healthEngine";

function getGrowthStage(dob) {
  if (!dob) return { label: "Newborn", emoji: "👶", ageText: "—", progressPercent: 0 };
  const now = new Date();
  const birth = new Date(dob);
  const diffMs = now.getTime() - birth.getTime();
  const totalDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const months = totalDays / 30.44;

  let label, emoji, progressPercent;
  if (months < 3) {
    label = "Newborn"; emoji = "👶";
    progressPercent = Math.min((months / 3) * 33, 33);
  } else if (months < 12) {
    label = "Infant"; emoji = "🍼";
    progressPercent = 33 + Math.min(((months - 3) / 9) * 33, 33);
  } else {
    label = "Toddler"; emoji = "🧒";
    progressPercent = Math.min(66 + ((months - 12) / 24) * 34, 100);
  }

  const ageMonths = Math.floor(months);
  const ageDays = totalDays - Math.floor(ageMonths * 30.44);
  const ageText = ageMonths < 1
    ? `${totalDays} day${totalDays !== 1 ? "s" : ""}`
    : `${ageMonths}m ${ageDays > 0 ? ageDays + "d" : ""}`.trim();

  return { label, emoji, progressPercent, ageText };
}

export default function KidsDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [kids, setKids] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newKid, setNewKid] = useState({ name: "", dob: "", gender: "Girl", weight: "", height: "", placeBirth: "", avatarFile: null, avatarPreview: "" });
  const [activeForm, setActiveForm] = useState(null); // "VACCINATION" | "GROWTH_MONITORING" | "VITAMIN_A" | "DEWORMING"
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [formData, setFormData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        router.push("/onboarding");
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!user) {
      setKids([]);
      return;
    }
    const q = query(collection(db, "children"), where("userId", "==", user.uid));
    const unsubscribeDb = onSnapshot(q, (snapshot) => {
      const kidsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setKids(kidsData);
      localStorage.setItem("infy_kids", JSON.stringify(kidsData));
    });
    return () => unsubscribeDb();
  }, [user]);

  const activeKid = kids[activeIndex] || null;

  // Dynamically compute child health summary using our core health engine
  const summary = useMemo(() => {
    return computeChildHealthSummary(activeKid);
  }, [activeKid]);

  const openForm = (activity) => {
    setSelectedActivity(activity);
    setActiveForm(activity.activityType);

    const baseData = {
      scheduleId: activity.scheduleId,
      scheduledDate: activity.scheduledDate || "",
      actualDate: new Date().toISOString().slice(0, 10),
      nextDueDate: "",
      clinicName: "",
      healthWorkerName: "",
      notes: "",
    };

    if (activity.activityType === "VACCINATION") {
      setFormData({
        ...baseData,
        vaccineName: activity.vaccines ? activity.vaccines.join(", ") : "",
      });
    } else if (activity.activityType === "GROWTH_MONITORING") {
      setFormData({
        ...baseData,
        weight: "",
        height: "",
        headCircumference: "",
      });
    } else if (activity.activityType === "VITAMIN_A") {
      setFormData({
        ...baseData,
        dose: activity.dose || "",
      });
    } else if (activity.activityType === "DEWORMING") {
      setFormData({
        ...baseData,
        medicineName: "",
        dose: "",
      });
    }
  };

  const saveForm = async () => {
    if (!activeKid || !user || !selectedActivity) return;
    setIsSaving(true);
    
    try {
      const kidRef = doc(db, "children", activeKid.id);
      let updateData = {};
      
      const record = {
        scheduleId: selectedActivity.scheduleId,
        scheduledDate: selectedActivity.scheduledDate || "",
        dateGiven: formData.actualDate, // Map to existing schema for compatibility
        dateMeasurement: formData.actualDate,
        actualDate: formData.actualDate,
        nextDueDate: formData.nextDueDate || null,
        clinicName: formData.clinicName || "",
        healthWorkerName: formData.healthWorkerName || "",
        notes: formData.notes || "",
        recordedAt: new Date().toISOString(),
      };

      if (activeForm === "VACCINATION") {
        record.vaccineName = formData.vaccineName;
        record.nextVaccineDate = formData.nextDueDate || "";
        updateData.vaccineRecords = [...(activeKid.vaccineRecords || []), record];
      } else if (activeForm === "GROWTH_MONITORING") {
        record.weight = formData.weight;
        record.height = formData.height;
        record.headCircumference = formData.headCircumference;
        record.nextVisitDate = formData.nextDueDate || "";
        updateData.weighingRecords = [...(activeKid.weighingRecords || []), record];
        updateData.weight = formData.weight; // Update latest weight on root object
      } else if (activeForm === "VITAMIN_A") {
        record.dose = formData.dose;
        record.nextVitaminADate = formData.nextDueDate || "";
        updateData.vitaminARecords = [...(activeKid.vitaminARecords || []), record];
      } else if (activeForm === "DEWORMING") {
        record.medicineName = formData.medicineName;
        record.dose = formData.dose;
        record.nextDewormingDate = formData.nextDueDate || "";
        updateData.dewormingRecords = [...(activeKid.dewormingRecords || []), record];
      }
      
      await updateDoc(kidRef, updateData);
      
      setIsSaving(false);
      setActiveForm(null);
      setSelectedActivity(null);
    } catch (error) {
      console.error("Error saving record:", error);
      setIsSaving(false);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setNewKid({ ...newKid, avatarFile: f, avatarPreview: URL.createObjectURL(f) });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newKid.name || !newKid.dob || !user) return;
    setIsSaving(true);
    
    try {
      let avatarUrl = "";
      if (newKid.avatarFile) {
        const imageRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
        await uploadBytes(imageRef, newKid.avatarFile);
        avatarUrl = await getDownloadURL(imageRef);
      }
      
      const childDoc = {
        userId: user.uid,
        name: newKid.name,
        dob: newKid.dob,
        gender: newKid.gender,
        weight: newKid.weight,
        height: newKid.height,
        placeBirth: newKid.placeBirth,
        avatar: avatarUrl,
        vaccineRecords: [],
        weighingRecords: [],
        vitaminARecords: [],
        dewormingRecords: [],
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, "children"), childDoc);
      
      setIsSaving(false);
      setSaveSuccess(newKid.name);
      setTimeout(() => {
        setSaveSuccess(false);
        setNewKid({ name: "", dob: "", gender: "Girl", weight: "", height: "", placeBirth: "", avatarFile: null, avatarPreview: "" });
        setIsAdding(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding child:", error);
      setIsSaving(false);
    }
  };

  if (authLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  // Form Modal Rendering
  if (activeForm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4" onClick={() => { setActiveForm(null); setSelectedActivity(null); }}>
        <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] pb-safe" style={{ scrollbarWidth: 'none' }} onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 py-2">
            <h2 className="text-xl font-black text-[#027027] capitalize">{activeForm.replace('_', ' ')} Form</h2>
            <button onClick={() => { setActiveForm(null); setSelectedActivity(null); }} className="text-gray-400 bg-gray-100 rounded-full p-1.5"><X size={18}/></button>
          </div>

          <p className="text-xs font-bold text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            🏥 Milestone: {selectedActivity?.title}
          </p>

          <div className="space-y-4">
            {activeForm === "VACCINATION" && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Date Given</label>
                  <input type="date" value={formData.actualDate} onChange={e => setFormData({...formData, actualDate: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Vaccine Name</label>
                  <input type="text" value={formData.vaccineName} onChange={e => setFormData({...formData, vaccineName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Clinic Name</label>
                  <input type="text" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm resize-none" />
                </div>
              </>
            )}

            {activeForm === "GROWTH_MONITORING" && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Date of Measurement</label>
                  <input required type="date" value={formData.dateMeasurement} onChange={e => setFormData({...formData, dateMeasurement: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Weight (kg)</label>
                    <input required type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Height (cm) (Opt)</label>
                    <input type="number" step="0.1" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Head Circ. (Opt)</label>
                    <input type="text" value={formData.headCircumference} onChange={e => setFormData({...formData, headCircumference: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Growth Status</label>
                    <select value={formData.growthStatus} onChange={e => setFormData({...formData, growthStatus: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 outline-none focus:border-[#027027] text-sm">
                      <option>Normal</option>
                      <option>Weight Gained</option>
                      <option>Weight Not Gaining</option>
                      <option>Weight Loss</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Growth Notes (Opt)</label>
                  <textarea value={formData.growthNotes} onChange={e => setFormData({...formData, growthNotes: e.target.value})} rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Health Observations (Opt)</label>
                  <textarea value={formData.healthObservations} onChange={e => setFormData({...formData, healthObservations: e.target.value})} rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#027027] uppercase mb-1 block">Next Visit Date</label>
                  <input type="date" disabled value={formData.nextVisitDate} className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 outline-none text-[#027027] text-sm font-bold opacity-80" />
                </div>
              </>
            )}

            {activeForm === "vitaminA" && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Date Given</label>
                  <input required type="date" value={formData.dateGiven} onChange={e => setFormData({...formData, dateGiven: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Dose</label>
                  <input required type="text" value={formData.dose} onChange={e => setFormData({...formData, dose: e.target.value})}
                    placeholder="e.g. 100,000 IU"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Health Facility / Doctor (Opt)</label>
                  <input type="text" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Notes (Opt)</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#027027] uppercase mb-1 block">Next Vitamin A Date</label>
                  <input type="date" disabled value={formData.nextVitaminADate} className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 outline-none text-[#027027] text-sm font-bold opacity-80" />
                </div>
              </>
            )}

            {activeForm === "deworming" && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Date Given</label>
                  <input required type="date" value={formData.dateGiven} onChange={e => setFormData({...formData, dateGiven: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Medicine Name</label>
                  <input required type="text" value={formData.medicineName} onChange={e => setFormData({...formData, medicineName: e.target.value})}
                    placeholder="e.g. Mebendazole"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Dose</label>
                  <input required type="text" value={formData.dose} onChange={e => setFormData({...formData, dose: e.target.value})}
                    placeholder="e.g. 500mg"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Health Facility / Doctor (Opt)</label>
                  <input type="text" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Notes (Opt)</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#027027] uppercase mb-1 block">Next Deworming Date</label>
                  <input type="date" disabled value={formData.nextDewormingDate} className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 outline-none text-[#027027] text-sm font-bold opacity-80" />
                </div>
              </>
            )}

          </div>

          <button onClick={saveForm} disabled={isSaving || (activeForm === "vaccine" ? !formData.vaccineName : activeForm === "weighing" ? !formData.weight : activeForm === "vitaminA" ? !formData.dose : !formData.medicineName)} 
            className="w-full mt-5 bg-[#027027] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
            {isSaving ? "Saving..." : <><Save size={18} /> Save & Mark Complete</>}
          </button>
        </div>
      </div>
    );
  }

  if (!activeKid) {
    if (isAdding) {
      return (
        <div className="p-4 pb-safe animate-in fade-in duration-300">
          <h2 className="text-xl font-bold text-[#027027] mb-4 text-center mt-4">Add Your First Child</h2>
          <form onSubmit={handleAdd} className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-center mb-2">
              <button type="button" onClick={() => fileRef.current.click()} className="relative">
                <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-[#027027] overflow-hidden flex items-center justify-center shadow-sm">
                  {newKid.avatarPreview ? <img src={newKid.avatarPreview} className="w-full h-full object-cover" alt="avatar" /> : <Camera size={24} className="text-[#027027]" />}
                </div>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
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
                <label className="text-xs font-bold text-gray-400 uppercase mb-0.5 block">Birth Weight (kg)</label>
                <input type="number" step="0.1" value={newKid.weight} onChange={e => setNewKid({...newKid, weight: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#027027] text-sm" placeholder="e.g. 3.5" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-0.5 block">Height (cm)</label>
                <input type="number" step="0.1" value={newKid.height} onChange={e => setNewKid({...newKid, height: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#027027] text-sm" placeholder="e.g. 50" />
              </div>
            </div>
            <button disabled={isSaving} type="submit" className="w-full mt-2 bg-[#027027] disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
              {isSaving ? "Saving to Cloud..." : <><Save size={18} /> Save Child Profile</>}
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 font-medium py-2 mt-1">Cancel</button>
          </form>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8">
        <span className="text-6xl mb-4">👶</span>
        <h2 className="text-xl font-bold text-gray-700 mb-2">No child added yet</h2>
        <p className="text-gray-500 text-sm mb-6">Add your first child to get started.</p>
        <button onClick={() => setIsAdding(true)} className="bg-green-50 border border-[#027027] text-[#027027] font-bold py-3 px-8 rounded-full shadow-sm hover:bg-green-100 transition active:scale-95">
          Add Child
        </button>
      </div>
    );
  }

  const growth = getGrowthStage(activeKid?.dob);
  const stages = ["Newborn", "Infant", "Toddler"];

  return (
    <div className="p-4 pb-safe space-y-6">

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {kids.map((kid, i) => (
          <button key={kid.id} onClick={() => setActiveIndex(i)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition ${
              i === activeIndex
                ? "bg-green-50 border border-[#027027] text-[#027027] shadow-sm"
                : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>
            {kid.avatar ? (
              <img src={kid.avatar} className="w-6 h-6 rounded-full object-cover border border-white/50" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"><User size={12} /></div>
            )}
            {kid.name}
          </button>
        ))}
        <button onClick={() => setIsAdding(true)} className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200">
          + Add
        </button>
      </div>

      <div className="relative bg-gradient-to-br from-[#027027] to-[#014d1a] rounded-[30px] p-6 text-white shadow-xl overflow-hidden -mt-2">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {activeKid.avatar ? (
              <img src={activeKid.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white/50 shadow-sm" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50"><User size={24} className="text-white" /></div>
            )}
            <div>
              <h2 className="text-xl font-black">{activeKid.name}'s Vitals</h2>
              <p className="text-xs text-green-100">Born {new Date(activeKid.dob).toLocaleDateString()}</p>
            </div>
          </div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">{growth.label}</span>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center relative overflow-hidden">
            {vaccineState.status === "due" && <div className="absolute top-0 w-full h-1 bg-red-400 animate-pulse" />}
            <Syringe className="mb-2 text-green-200" size={24} />
            <div className="flex items-end justify-center gap-1">
              <span className={`text-2xl font-black ${vaccineState.status === "due" ? 'text-red-300' : 'text-white'}`}>{vaccineState.status === "due" ? 'Due' : vaccineState.status === "done" ? 'Done' : vaccineState.days}</span>
              {vaccineState.status !== "due" && vaccineState.status !== "done" && <span className="text-[10px] uppercase font-bold text-green-100 mb-1">Days</span>}
            </div>
            <span className="text-[10px] text-green-50 mt-1 opacity-80">Next Vaccine</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center relative overflow-hidden">
            {weighingState.status === "due" && <div className="absolute top-0 w-full h-1 bg-red-400 animate-pulse" />}
            <Activity className="mb-2 text-yellow-200" size={24} />
            <div className="flex items-end justify-center gap-1">
              <span className={`text-2xl font-black ${weighingState.status === "due" ? 'text-red-300' : 'text-yellow-400'}`}>{weighingState.status === "due" ? 'Due' : weighingState.status === "done" ? 'Done' : weighingState.days}</span>
              {weighingState.status !== "due" && weighingState.status !== "done" && <span className="text-[10px] uppercase font-bold text-yellow-100 mb-1">Days</span>}
            </div>
            <span className="text-[10px] text-yellow-50 mt-1 opacity-80">Next Weighing</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[#027027] text-sm font-bold mb-4">Current Growth Stage</h2>
        <div className="bg-green-50 border border-green-200 rounded-[20px] p-5 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto bg-[#027027] rounded-full flex items-center justify-center text-white mb-2 shadow-md">
            <Footprints size={28} />
          </div>
          <h3 className="text-xl font-black text-[#027027] mb-1">{growth.label}</h3>
          <p className="text-xs text-gray-500 mb-5">Age: {growth.ageText}</p>

          <div className="relative px-1 mb-8">
            <div className="h-1.5 w-full bg-green-200 rounded-full" />
            <div className="absolute top-0 left-1 h-1.5 bg-[#027027] rounded-full transition-all duration-700" style={{ width: `calc(${growth.progressPercent}% - 4px)` }} />
            <div className="absolute top-[-3.5px] w-3.5 h-3.5 bg-[#027027] rounded-full border border-white shadow-sm transition-all duration-700" style={{ left: `calc(${growth.progressPercent}% - 4px)` }} />
            <div className="flex justify-between mt-2 px-0 text-[9px] text-[#027027]/60 font-bold uppercase tracking-tight">
              {stages.map((s, i) => (
                <span key={i} className={s === growth.label ? "text-[#027027]" : ""}>{s}</span>
              ))}
            </div>
          </div>

          <Link href="/learn-more" className="block w-full bg-[#027027] hover:bg-[#014d1a] transition py-3.5 rounded-xl text-white font-bold text-sm shadow-md active:scale-95">
            Learn More About This Stage
          </Link>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h2 className="text-[#027027] text-sm font-bold mb-3">Action Forms</h2>
        <div className="space-y-3">

          <div className={`border rounded-2xl p-4 flex justify-between items-center shadow-sm transition ${vaccineState.status === "due" ? 'bg-red-50 border-red-200' : vaccineState.status === "pending" ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${vaccineState.status === "due" ? 'bg-red-100 text-red-600' : vaccineState.status === "pending" ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-[#027027]'}`}>
                <Syringe size={18} />
              </div>
              <div>
                <span className={`text-sm font-bold ${vaccineState.status === "due" ? 'text-red-900' : vaccineState.status === "pending" ? 'text-gray-600' : 'text-[#027027]'}`}>Vaccination</span>
                {activeKid.vaccineRecords?.length > 0 && (
                  <span className="block text-[10px] text-[#027027] mt-1 font-semibold">
                    Last: {activeKid.vaccineRecords[activeKid.vaccineRecords.length-1].vaccineName}
                  </span>
                )}
              </div>
            </div>
            {vaccineState.status === "due" ? (
              <button onClick={() => openForm("vaccine")} className="bg-[#027027] text-white text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 shadow-sm">
                {vaccineState.label}
              </button>
            ) : vaccineState.status === "pending" ? (
              <span className="text-xs font-bold text-gray-500 px-4 py-2 rounded-xl bg-gray-200">{vaccineState.label}</span>
            ) : (
              <span className="text-xs font-bold text-[#027027] px-4 py-2 rounded-xl bg-green-100">{vaccineState.label}</span>
            )}
          </div>

          <div className={`border rounded-2xl p-4 flex justify-between items-center shadow-sm transition ${weighingState.status === "due" ? 'bg-red-50 border-red-200' : weighingState.status === "pending" ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${weighingState.status === "due" ? 'bg-red-100 text-red-600' : weighingState.status === "pending" ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-[#027027]'}`}>
                <Activity size={18} />
              </div>
              <div>
                <span className={`text-sm font-bold ${weighingState.status === "due" ? 'text-red-900' : weighingState.status === "pending" ? 'text-gray-600' : 'text-[#027027]'}`}>Weighing</span>
                {activeKid.weight && <span className="block text-[10px] text-[#027027] mt-1 font-semibold">Last Weight: {activeKid.weight} kg</span>}
              </div>
            </div>
            {weighingState.status === "due" ? (
              <button onClick={() => openForm("weighing")} className="bg-[#027027] text-white text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 shadow-sm">
                {weighingState.label}
              </button>
            ) : weighingState.status === "pending" ? (
              <span className="text-xs font-bold text-gray-500 px-4 py-2 rounded-xl bg-gray-200">{weighingState.label}</span>
            ) : (
              <span className="text-xs font-bold text-[#027027] px-4 py-2 rounded-xl bg-green-100">{weighingState.label}</span>
            )}
          </div>

          <div className={`border rounded-2xl p-4 flex justify-between items-center shadow-sm transition bg-white border-gray-100`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-blue-50 text-blue-600`}>
                <TestTube size={18} />
              </div>
              <div>
                <span className={`text-sm font-bold text-gray-800`}>Vitamin A</span>
                {activeKid.vitaminARecords?.length > 0 && (
                  <span className="block text-[10px] text-blue-600 mt-1 font-semibold">
                    Last: {activeKid.vitaminARecords[activeKid.vitaminARecords.length-1].dateGiven}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => openForm("vitaminA")} className={`bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 shadow-sm`}>
              Open Form
            </button>
          </div>

          <div className={`border rounded-2xl p-4 flex justify-between items-center shadow-sm transition bg-white border-gray-100`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-purple-50 text-purple-600`}>
                <Pill size={18} />
              </div>
              <div>
                <span className={`text-sm font-bold text-gray-800`}>Deworming</span>
                {activeKid.dewormingRecords?.length > 0 && (
                  <span className="block text-[10px] text-purple-600 mt-1 font-semibold">
                    Last: {activeKid.dewormingRecords[activeKid.dewormingRecords.length-1].dateGiven}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => openForm("deworming")} className={`bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 shadow-sm`}>
              Open Form
            </button>
          </div>

        </div>
      </div>

      {isAdding && activeKid && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] relative" style={{ scrollbarWidth: 'none' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#027027]">Add Child</h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 bg-gray-100 rounded-full p-1.5"><X size={18}/></button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="flex justify-center mb-2">
                <button type="button" onClick={() => fileRef.current.click()} className="relative">
                  <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-[#027027] overflow-hidden flex items-center justify-center shadow-sm">
                    {newKid.avatarPreview ? <img src={newKid.avatarPreview} className="w-full h-full object-cover" alt="avatar" /> : <Camera size={24} className="text-[#027027]" />}
                  </div>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
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
                  <label className="text-xs font-bold text-gray-400 uppercase mb-0.5 block">Birth Weight (kg)</label>
                  <input type="number" step="0.1" value={newKid.weight} onChange={e => setNewKid({...newKid, weight: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#027027] text-sm" placeholder="e.g. 3.5" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-0.5 block">Height (cm)</label>
                  <input type="number" step="0.1" value={newKid.height} onChange={e => setNewKid({...newKid, height: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#027027] text-sm" placeholder="e.g. 50" />
                </div>
              </div>
              <button disabled={isSaving} type="submit" className="w-full mt-2 bg-[#027027] disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
                {isSaving ? "Saving to Cloud..." : <><Save size={18} /> Save Child Profile</>}
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

    </div>
  );
}
