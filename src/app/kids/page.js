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

  const deleteHistoryRecord = async (rec) => {
    if (!activeKid || !user) return;
    if (!confirm("Are you sure you want to delete this record?")) return;
    
    try {
      const kidRef = doc(db, "children", activeKid.id);
      let updateData = {};
      
      if (rec.type === "VACCINATION") {
        updateData.vaccineRecords = (activeKid.vaccineRecords || []).filter(r => r.recordedAt !== rec.recordedAt);
      } else if (rec.type === "GROWTH_MONITORING") {
        updateData.weighingRecords = (activeKid.weighingRecords || []).filter(r => r.recordedAt !== rec.recordedAt);
      } else if (rec.type === "VITAMIN_A") {
        updateData.vitaminARecords = (activeKid.vitaminARecords || []).filter(r => r.recordedAt !== rec.recordedAt);
      } else if (rec.type === "DEWORMING") {
        updateData.dewormingRecords = (activeKid.dewormingRecords || []).filter(r => r.recordedAt !== rec.recordedAt);
      }

      await updateDoc(kidRef, updateData);
    } catch (err) {
      console.error(err);
      alert("Failed to delete record.");
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
      
      const notifs = JSON.parse(localStorage.getItem("infy_notifications") || "[]");
      notifs.unshift({
        id: `profile_${Date.now()}`,
        title: "New Profile Added",
        desc: `Tracking initialized for ${newKid.name}. We'll monitor upcoming weigh-ins!`,
        time: "Just now",
        timestamp: Date.now(),
        unread: true,
        type: "profile"
      });
      localStorage.setItem("infy_notifications", JSON.stringify(notifs));
      window.dispatchEvent(new Event("storage"));
      
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

  // Form Input Style
  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm transition";
  const labelCls = "text-xs font-bold text-gray-400 uppercase mb-0.5 block";
  const sectionCls = "flex flex-col gap-3";

  // Form Modal Rendering
  if (activeForm) {
    const formTitle = activeForm === "VACCINATION" ? "Vaccination" : activeForm === "GROWTH_MONITORING" ? "Growth Monitoring" : activeForm === "VITAMIN_A" ? "Vitamin A" : "Deworming";
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4 sm:p-6" onClick={() => { setActiveForm(null); setSelectedActivity(null); }}>
        <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-y-auto max-h-[92vh] pb-safe mb-4" style={{ scrollbarWidth: 'none' }} onClick={(e) => e.stopPropagation()}>
          {/* Form Header */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-[32px]">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900">{formTitle} Record</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedActivity?.title}</p>
              </div>
              <button onClick={() => { setActiveForm(null); setSelectedActivity(null); }} className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition"><X size={18}/></button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">

            {activeForm === "VACCINATION" && (
              <>
                <div className={sectionCls}>
                  <div>
                    <label className={labelCls}>Date Vaccine Given</label>
                    <input type="date" value={formData.actualDate} onChange={e => setFormData({...formData, actualDate: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Vaccine Name</label>
                    <input type="text" value={formData.vaccineName} onChange={e => setFormData({...formData, vaccineName: e.target.value})} className={inputCls} placeholder="e.g. BCG, Pentavalent" />
                  </div>
                  <div>
                    <label className={labelCls}>Clinic / Health Facility</label>
                    <input type="text" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} className={inputCls} placeholder="e.g. City Health Center" />
                  </div>
                  <div>
                    <label className={labelCls}>Health Worker Name (Opt)</label>
                    <input type="text" value={formData.healthWorkerName} onChange={e => setFormData({...formData, healthWorkerName: e.target.value})} className={inputCls} placeholder="Name of nurse or doctor" />
                  </div>
                  <div>
                    <label className={labelCls}>Notes (Opt)</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} className={`${inputCls} resize-none`} placeholder="Any observations or reactions" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <label className="text-[11px] font-bold text-[#027027] uppercase tracking-wide mb-1.5 block">📅 Next Visit Date (if given)</label>
                  <input type="date" value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} className="w-full bg-white border border-green-200 rounded-2xl px-4 py-3 outline-none focus:border-[#027027] focus:ring-2 focus:ring-[#027027]/10 text-sm text-[#027027] font-semibold transition" />
                </div>
              </>
            )}

            {activeForm === "GROWTH_MONITORING" && (
              <>
                <div className={sectionCls}>
                  <div>
                    <label className={labelCls}>Date of Measurement</label>
                    <input required type="date" value={formData.dateMeasurement} onChange={e => setFormData({...formData, dateMeasurement: e.target.value, actualDate: e.target.value})} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Weight (kg)</label>
                      <input required type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className={inputCls} placeholder="e.g. 7.2" />
                    </div>
                    <div>
                      <label className={labelCls}>Height (cm)</label>
                      <input type="number" step="0.1" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className={inputCls} placeholder="e.g. 68" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Head Circ. (cm)</label>
                      <input type="text" value={formData.headCircumference} onChange={e => setFormData({...formData, headCircumference: e.target.value})} className={inputCls} placeholder="Optional" />
                    </div>
                    <div>
                      <label className={labelCls}>Growth Status</label>
                      <select value={formData.growthStatus} onChange={e => setFormData({...formData, growthStatus: e.target.value})} className={inputCls}>
                        <option>Normal</option>
                        <option>Weight Gained</option>
                        <option>Weight Not Gaining</option>
                        <option>Weight Loss</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Growth Notes (Opt)</label>
                    <textarea value={formData.growthNotes} onChange={e => setFormData({...formData, growthNotes: e.target.value})} rows={2} className={`${inputCls} resize-none`} placeholder="e.g. Baby is growing well" />
                  </div>
                  <div>
                    <label className={labelCls}>Health Observations (Opt)</label>
                    <textarea value={formData.healthObservations} onChange={e => setFormData({...formData, healthObservations: e.target.value})} rows={2} className={`${inputCls} resize-none`} placeholder="Any health concerns noted" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <label className="text-[11px] font-bold text-[#027027] uppercase tracking-wide mb-1.5 block">📅 Next Visit Date (if given)</label>
                  <input type="date" value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} className="w-full bg-white border border-green-200 rounded-2xl px-4 py-3 outline-none focus:border-[#027027] focus:ring-2 focus:ring-[#027027]/10 text-sm text-[#027027] font-semibold transition" />
                </div>
              </>
            )}

            {activeForm === "VITAMIN_A" && (
              <>
                <div className={sectionCls}>
                  <div>
                    <label className={labelCls}>Date Given</label>
                    <input required type="date" value={formData.actualDate} onChange={e => setFormData({...formData, actualDate: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Dose</label>
                    <input required type="text" value={formData.dose} onChange={e => setFormData({...formData, dose: e.target.value})} placeholder="e.g. 100,000 IU" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Clinic / Health Facility (Opt)</label>
                    <input type="text" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} className={inputCls} placeholder="e.g. City Health Center" />
                  </div>
                  <div>
                    <label className={labelCls}>Health Worker Name (Opt)</label>
                    <input type="text" value={formData.healthWorkerName} onChange={e => setFormData({...formData, healthWorkerName: e.target.value})} className={inputCls} placeholder="Name of nurse or doctor" />
                  </div>
                  <div>
                    <label className={labelCls}>Notes (Opt)</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} className={`${inputCls} resize-none`} placeholder="Any observations" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <label className="text-[11px] font-bold text-[#027027] uppercase tracking-wide mb-1.5 block">📅 Next Visit Date (if given)</label>
                  <input type="date" value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} className="w-full bg-white border border-green-200 rounded-2xl px-4 py-3 outline-none focus:border-[#027027] focus:ring-2 focus:ring-[#027027]/10 text-sm text-[#027027] font-semibold transition" />
                </div>
              </>
            )}

            {activeForm === "DEWORMING" && (
              <>
                <div className={sectionCls}>
                  <div>
                    <label className={labelCls}>Date Given</label>
                    <input required type="date" value={formData.actualDate} onChange={e => setFormData({...formData, actualDate: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Medicine Name</label>
                    <input required type="text" value={formData.medicineName} onChange={e => setFormData({...formData, medicineName: e.target.value})} placeholder="e.g. Mebendazole" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Dose</label>
                    <input required type="text" value={formData.dose} onChange={e => setFormData({...formData, dose: e.target.value})} placeholder="e.g. 500mg" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Clinic / Health Facility (Opt)</label>
                    <input type="text" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} className={inputCls} placeholder="e.g. City Health Center" />
                  </div>
                  <div>
                    <label className={labelCls}>Health Worker Name (Opt)</label>
                    <input type="text" value={formData.healthWorkerName} onChange={e => setFormData({...formData, healthWorkerName: e.target.value})} className={inputCls} placeholder="Name of nurse or doctor" />
                  </div>
                  <div>
                    <label className={labelCls}>Notes (Opt)</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} className={`${inputCls} resize-none`} placeholder="Any observations" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <label className="text-[11px] font-bold text-[#027027] uppercase tracking-wide mb-1.5 block">📅 Next Visit Date (if given)</label>
                  <input type="date" value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} className="w-full bg-white border border-green-200 rounded-2xl px-4 py-3 outline-none focus:border-[#027027] focus:ring-2 focus:ring-[#027027]/10 text-sm text-[#027027] font-semibold transition" />
                </div>
              </>
            )}

            <button onClick={saveForm} disabled={isSaving}
              className="w-full mt-2 bg-[#027027] disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
              {isSaving ? "Saving..." : <><Save size={18} /> Save &amp; Mark Complete</>}
            </button>
            <div className="pb-2" />
          </div>
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
        <img src="/images/newchildicon.png" alt="Child" className="w-24 h-24 mx-auto mb-4 object-contain" />
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

  // Helper formatting for Summary tiles
  const formatCountdown = (activity, customTitle) => {
    if (!activity) return { value: "Done", label: customTitle, isOverdue: false, isDue: false };
    const date = activity.nextDueDate || activity.scheduledDate;
    const days = getDaysRemaining(date);
    if (days === null) return { value: "—", label: customTitle, isOverdue: false, isDue: false };
    if (days < 0) return { value: "Overdue", label: `${Math.abs(days)}d ago`, isOverdue: true, isDue: false };
    if (days === 0) return { value: "Due Today", label: customTitle, isOverdue: false, isDue: true };
    return { value: `${days}d`, label: "Remaining", isOverdue: false, isDue: false };
  };

  const vaxTile = formatCountdown(summary?.nextVaccine, "Next Vaccine");
  const growthTile = formatCountdown(summary?.nextGrowth, "Next Weighing");
  const vitATile = formatCountdown(summary?.nextVitaminA, "Next Vitamin A");

  let dewormingTile = { value: "None", label: "Deworming", isOverdue: false, isDue: false };
  if (summary?.nextDeworming) {
    const dwDays = summary.nextDeworming.days;
    if (dwDays === null) {
      dewormingTile = { value: "None", label: "Deworming", isOverdue: false, isDue: false };
    } else if (dwDays < 0) {
      dewormingTile = { value: "Overdue", label: `${Math.abs(dwDays)}d ago`, isOverdue: true, isDue: false };
    } else if (dwDays === 0) {
      dewormingTile = { value: "Due Today", label: "Deworming", isOverdue: false, isDue: true };
    } else {
      dewormingTile = { value: `${dwDays}d`, label: "Remaining", isOverdue: false, isDue: false };
    }
  }

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

        <div className="relative z-10 grid grid-cols-4 gap-2">
          {/* Vaccine */}
          <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center relative overflow-hidden">
            {vaxTile.isDue && <div className="absolute inset-0 rounded-2xl border border-yellow-300 animate-pulse pointer-events-none" />}
            {vaxTile.isOverdue && <div className="absolute top-0 w-full h-1 bg-red-400 animate-pulse" />}
            <Syringe className="mb-1 text-green-200" size={18} />
            <span className={`text-sm font-bold leading-tight ${vaxTile.isOverdue ? 'text-red-300' : vaxTile.isDue ? 'text-yellow-300' : 'text-white'}`}>{vaxTile.value}</span>
            <span className="text-[9px] text-green-100 opacity-80 leading-none mt-0.5">{vaxTile.label}</span>
          </div>

          {/* Weighing */}
          <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center relative overflow-hidden">
            {growthTile.isDue && <div className="absolute inset-0 rounded-2xl border border-yellow-300 animate-pulse pointer-events-none" />}
            {growthTile.isOverdue && <div className="absolute top-0 w-full h-1 bg-red-400 animate-pulse" />}
            <Activity className="mb-1 text-yellow-200" size={18} />
            <span className={`text-sm font-bold leading-tight ${growthTile.isOverdue ? 'text-red-300' : growthTile.isDue ? 'text-yellow-300' : 'text-yellow-400'}`}>{growthTile.value}</span>
            <span className="text-[9px] text-yellow-100 opacity-80 leading-none mt-0.5">{growthTile.label}</span>
          </div>

          {/* Vitamin A */}
          <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center relative overflow-hidden">
            {vitATile.isDue && <div className="absolute inset-0 rounded-2xl border border-yellow-300 animate-pulse pointer-events-none" />}
            {vitATile.isOverdue && <div className="absolute top-0 w-full h-1 bg-red-400 animate-pulse" />}
            <TestTube className="mb-1 text-blue-200" size={18} />
            <span className={`text-sm font-bold leading-tight ${vitATile.isOverdue ? 'text-red-300' : vitATile.isDue ? 'text-yellow-300' : 'text-white'}`}>{vitATile.value}</span>
            <span className="text-[9px] text-blue-100 opacity-80 leading-none mt-0.5">{vitATile.label}</span>
          </div>

        {/* Deworming */}
          <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center relative overflow-hidden">
            {dewormingTile.isDue && <div className="absolute inset-0 rounded-2xl border border-yellow-300 animate-pulse pointer-events-none" />}
            {dewormingTile.isOverdue && <div className="absolute top-0 w-full h-1 bg-red-400 animate-pulse" />}
            <Pill className="mb-1 text-purple-200" size={18} />
            <span className={`text-sm font-bold leading-tight ${dewormingTile.isOverdue ? 'text-red-300' : dewormingTile.isDue ? 'text-yellow-300' : 'text-white'}`}>{dewormingTile.value}</span>
            <span className="text-[9px] text-purple-100 opacity-80 leading-none mt-0.5">{dewormingTile.label}</span>
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

      {/* Due Action Forms */}
      <div>
        <h2 className="text-[#027027] text-sm font-bold mb-3 flex items-center gap-1">
          🔔 Active Checklist ({summary?.dueForms?.length || 0})
        </h2>
        
        {summary?.dueForms && summary.dueForms.length > 0 ? (
          <div className="space-y-3">
            {summary.dueForms.map((act) => {
              const isOverdue = act.status === "OVERDUE";
              return (
                <div key={act.scheduleId} className={`border rounded-2xl p-4 flex justify-between items-center shadow-sm transition ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-green-100 text-[#027027]'}`}>
                      {act.activityType === "VACCINATION" && <Syringe size={18} />}
                      {act.activityType === "GROWTH_MONITORING" && <Activity size={18} />}
                      {act.activityType === "VITAMIN_A" && <TestTube size={18} />}
                      {act.activityType === "DEWORMING" && <Pill size={18} />}
                    </div>
                    <div>
                      <span className={`text-sm font-bold ${isOverdue ? 'text-red-900' : 'text-[#027027]'}`}>{act.title}</span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">
                        Due: {act.nextDueDate || act.scheduledDate}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => openForm(act)} className="bg-[#027027] text-white text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 shadow-sm">
                    {isOverdue ? "Overdue" : "Record"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 border border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-400">
            ✅ All schedules are currently up-to-date!
          </div>
        )}
      </div>

      {/* Late Registration Section */}
      {summary?.pastUnrecorded && summary.pastUnrecorded.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-[20px] p-5 shadow-sm">
          <div className="flex gap-3">
            <AlertCircle size={22} className="text-orange-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-black text-orange-950">Add Previous Health Records</h3>
              <p className="text-[11px] text-orange-800/80 leading-relaxed mt-1 mb-3">
                This child has historical milestone dates in the past. You can record what they received from their paper health card so their timeline stays completely accurate.
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1" style={{ scrollbarWidth: 'none' }}>
                {summary.pastUnrecorded.map((act) => (
                  <button key={act.scheduleId} onClick={() => openForm(act)} className="w-full flex items-center justify-between text-left bg-white border border-orange-100 rounded-xl p-2.5 text-xs text-orange-900 shadow-sm active:scale-[0.99] transition">
                    <span className="font-bold">{act.title}</span>
                    <span className="text-[10px] text-orange-500 flex items-center gap-1 font-bold">
                      Add Record <Plus size={10} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health History */}
      <div>
        <h2 className="text-[#027027] text-sm font-bold mb-3 flex items-center gap-1.5">
          <History size={16} /> Complete Health History ({summary?.history?.length || 0})
        </h2>

        {summary?.history && summary.history.length > 0 ? (
          <div className="space-y-3">
            {summary.history.map((rec, index) => (
              <div key={index} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-[#027027]">
                      {rec.type === "VACCINATION" && <Syringe size={12} />}
                      {rec.type === "GROWTH_MONITORING" && <Activity size={12} />}
                      {rec.type === "VITAMIN_A" && <TestTube size={12} />}
                      {rec.type === "DEWORMING" && <Pill size={12} />}
                    </div>
                    <span className="text-xs font-black text-gray-800 capitalize">
                      {rec.type.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {new Date(rec.date).toLocaleDateString()}
                  </span>
                </div>
                
                <button onClick={() => deleteHistoryRecord(rec)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition active:scale-95 p-1">
                  <Trash2 size={16} />
                </button>

                <div className="text-xs text-gray-600 pl-8 space-y-1">
                  {rec.type === "VACCINATION" && (
                    <p className="font-bold text-[#027027]">{rec.vaccineName}</p>
                  )}
                  {rec.type === "GROWTH_MONITORING" && (
                    <div className="grid grid-cols-3 gap-1 bg-gray-50 p-2 rounded-xl border border-gray-100 font-semibold text-center text-[10px]">
                      <div>Weight: <span className="text-[#027027]">{rec.weight} kg</span></div>
                      {rec.height && <div>Height: <span className="text-[#027027]">{rec.height} cm</span></div>}
                      {rec.headCircumference && <div>Head: <span className="text-[#027027]">{rec.headCircumference} cm</span></div>}
                    </div>
                  )}
                  {rec.type === "VITAMIN_A" && (
                    <p className="font-bold text-[#027027]">Dose: {rec.dose}</p>
                  )}
                  {rec.type === "DEWORMING" && (
                    <p className="font-bold text-[#027027]">{rec.medicineName} ({rec.dose})</p>
                  )}

                  {(rec.clinicName || rec.healthWorkerName) && (
                    <p className="text-[10px] text-gray-400">
                      📍 {rec.clinicName || "Clinic"} {rec.healthWorkerName ? `| Staff: ${rec.healthWorkerName}` : ""}
                    </p>
                  )}
                  {rec.notes && <p className="text-[10px] italic text-gray-500">Note: "{rec.notes}"</p>}
                  {rec.nextDueDate && (
                    <p className="text-[10px] font-bold text-[#027027] bg-green-50/50 p-1.5 rounded border border-green-100/50 block">
                      📅 Next Visit: {rec.nextDueDate}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-400">
            No completed health events in history yet.
          </div>
        )}
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
