"use client";
import { useEffect, useState, useRef } from "react";
import { Calendar, Activity, Footprints, CheckCircle, AlertCircle, Save, X, Syringe, User, Camera } from "lucide-react";
import Link from "next/link";

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

function getDaysToNext(records, dob) {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // records is an array of completed actions. 
  // Each record represents one completed monthly action.
  const completedMonths = (records && Array.isArray(records)) ? records.length : 0;
  
  // The next target date is `completedMonths + 1` months from DOB
  const nextTarget = new Date(birthDate.getFullYear(), birthDate.getMonth() + completedMonths + 1, birthDate.getDate());
  
  const diffMs = nextTarget.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return daysLeft < 0 ? 0 : daysLeft;
}

function getNextDate(records, dob) {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const completedMonths = (records && Array.isArray(records)) ? records.length : 0;
  const nextTarget = new Date(birthDate.getFullYear(), birthDate.getMonth() + completedMonths + 1, birthDate.getDate());
  return nextTarget.toISOString().slice(0, 10);
}

export default function KidsDashboard() {
  const [kids, setKids] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newKid, setNewKid] = useState({ name: "", dob: "", gender: "Girl", weight: "", height: "", placeBirth: "", avatar: "" });
  const [activeForm, setActiveForm] = useState(null); // "vaccine" | "weighing"
  const [formData, setFormData] = useState({});
  const fileRef = useRef();

  useEffect(() => {
    const stored = localStorage.getItem("infy_kids");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old data if necessary
      const migrated = parsed.map(k => ({
        ...k,
        vaccineRecords: k.vaccineRecords || [],
        weighingRecords: k.weighingRecords || []
      }));
      setKids(migrated);
    }
  }, []);

  const activeKid = kids[activeIndex] || null;

  const openForm = (type) => {
    setActiveForm(type);
    if (type === "vaccine") {
      setFormData({
        vaccineName: "",
        dateGiven: new Date().toISOString().slice(0,10),
        vaccineType: "",
        doseNumber: "",
        clinicName: "",
        notes: "",
        nextVaccineDate: getNextDate(activeKid?.vaccineRecords, activeKid?.dob)
      });
    } else {
      setFormData({
        dateMeasurement: new Date().toISOString().slice(0,10),
        weight: "",
        height: "",
        headCircumference: "",
        growthNotes: "",
        healthObservations: ""
      });
    }
  };

  const saveForm = () => {
    if (!activeKid) return;
    const updatedKids = kids.map(k => {
      if (k.id === activeKid.id) {
        if (activeForm === "vaccine") {
          const records = k.vaccineRecords || [];
          return { ...k, vaccineRecords: [...records, formData] };
        }
        if (activeForm === "weighing") {
          const records = k.weighingRecords || [];
          return { ...k, weighingRecords: [...records, formData], weight: formData.weight || k.weight };
        }
      }
      return k;
    });
    setKids(updatedKids);
    localStorage.setItem("infy_kids", JSON.stringify(updatedKids));
    setActiveForm(null);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) setNewKid({ ...newKid, avatar: URL.createObjectURL(f) });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newKid.name || !newKid.dob) return;
    const updated = [...kids, { ...newKid, id: Date.now().toString(), vaccineRecords: [], weighingRecords: [] }];
    setKids(updated);
    localStorage.setItem("infy_kids", JSON.stringify(updated));
    setActiveIndex(updated.length - 1);
    setIsAdding(false);
    setNewKid({ name: "", dob: "", gender: "Girl", weight: "", height: "", placeBirth: "", avatar: "" });
  };

  const growth = getGrowthStage(activeKid?.dob);
  const stages = ["Newborn", "Infant", "Toddler"];

  const vaccineDaysLeft = getDaysToNext(activeKid?.vaccineRecords, activeKid?.dob);
  const weighingDaysLeft = getDaysToNext(activeKid?.weighingRecords, activeKid?.dob);

  // Form Modal
  if (activeForm) {
    const isVaccine = activeForm === "vaccine";
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 overflow-y-auto max-h-[90vh] pb-safe" style={{ scrollbarWidth: 'none' }}>
          <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 py-2">
            <h2 className="text-xl font-black text-[#027027]">{isVaccine ? "Vaccination Form" : "Weighing Form"}</h2>
            <button onClick={() => setActiveForm(null)} className="text-gray-400 bg-gray-100 rounded-full p-1.5"><X size={18}/></button>
          </div>

          <div className="space-y-4">
            {isVaccine ? (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Vaccine Name</label>
                  <input required type="text" value={formData.vaccineName} onChange={e => setFormData({...formData, vaccineName: e.target.value})}
                    placeholder="e.g. BCG, OPV"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Date Given</label>
                    <input type="date" value={formData.dateGiven} onChange={e => setFormData({...formData, dateGiven: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Dose Number</label>
                    <input type="text" value={formData.doseNumber} onChange={e => setFormData({...formData, doseNumber: e.target.value})}
                      placeholder="e.g. 1, 2, Booster"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Vaccine Type</label>
                  <input type="text" value={formData.vaccineType} onChange={e => setFormData({...formData, vaccineType: e.target.value})}
                    placeholder="e.g. Oral, Injectable"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Health Facility / Doctor (Optional)</label>
                  <input type="text" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})}
                    placeholder="Clinic or Doctor Name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Notes (Optional)</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any observations..."
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block text-[#027027]">Next Vaccination Date</label>
                  <input type="date" disabled value={formData.nextVaccineDate}
                    className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 outline-none text-[#027027] text-sm font-bold opacity-80" />
                  <span className="text-[10px] text-gray-500 mt-1 block">Auto-generated based on timeline</span>
                </div>
              </>
            ) : (
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
                      placeholder="e.g. 7.5"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Height (cm) (Opt)</label>
                    <input type="number" step="0.1" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})}
                      placeholder="e.g. 60"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Head Circumference (Opt)</label>
                  <input type="text" value={formData.headCircumference} onChange={e => setFormData({...formData, headCircumference: e.target.value})}
                    placeholder="e.g. 40 cm"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Growth Notes</label>
                  <textarea value={formData.growthNotes} onChange={e => setFormData({...formData, growthNotes: e.target.value})}
                    placeholder="General growth milestones noticed..."
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Health Observations (Opt)</label>
                  <textarea value={formData.healthObservations} onChange={e => setFormData({...formData, healthObservations: e.target.value})}
                    placeholder="Any health issues?"
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#027027] text-sm resize-none" />
                </div>
              </>
            )}
          </div>

          <button onClick={saveForm} disabled={isVaccine ? !formData.vaccineName : !formData.weight} className="w-full mt-5 bg-[#027027] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
            <Save size={18} /> Save & Mark Complete
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
            
            {/* Avatar Upload */}
            <div className="flex justify-center mb-2">
              <button type="button" onClick={() => fileRef.current.click()} className="relative">
                <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-[#027027] overflow-hidden flex items-center justify-center shadow-sm">
                  {newKid.avatar ? <img src={newKid.avatar} className="w-full h-full object-cover" alt="avatar" /> : <Camera size={24} className="text-[#027027]" />}
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
            <button type="submit" className="w-full mt-2 bg-[#027027] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
              <Save size={18} /> Save Child Profile
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

  return (
    <div className="p-4 pb-safe space-y-6">

      {/* Child Switcher */}
      {kids.length > 1 && (
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
      )}

      {/* Dashboard Card */}
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
            {vaccineDaysLeft === 0 && <div className="absolute top-0 w-full h-1 bg-red-400 animate-pulse" />}
            <Syringe className="mb-2 text-green-200" size={24} />
            <div className="flex items-end justify-center gap-1">
              <span className={`text-2xl font-black ${vaccineDaysLeft === 0 ? 'text-red-300' : 'text-white'}`}>{vaccineDaysLeft === 0 ? 'Due' : vaccineDaysLeft}</span>
              {vaccineDaysLeft !== 0 && <span className="text-[10px] uppercase font-bold text-green-100 mb-1">Days</span>}
            </div>
            <span className="text-[10px] text-green-50 mt-1 opacity-80">Next Vaccine</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center relative overflow-hidden">
            {weighingDaysLeft === 0 && <div className="absolute top-0 w-full h-1 bg-red-400 animate-pulse" />}
            <Activity className="mb-2 text-yellow-200" size={24} />
            <div className="flex items-end justify-center gap-1">
              <span className={`text-2xl font-black ${weighingDaysLeft === 0 ? 'text-red-300' : 'text-yellow-400'}`}>{weighingDaysLeft === 0 ? 'Due' : weighingDaysLeft}</span>
              {weighingDaysLeft !== 0 && <span className="text-[10px] uppercase font-bold text-yellow-100 mb-1">Days</span>}
            </div>
            <span className="text-[10px] text-yellow-50 mt-1 opacity-80">Next Weighing</span>
          </div>
        </div>
      </div>

      {/* Urgent Reminders */}
      {(vaccineDaysLeft === 0 || weighingDaysLeft === 0) && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
          <div className="bg-red-500 text-white p-2 rounded-full mt-0.5"><AlertCircle size={18} /></div>
          <div>
            <h4 className="text-red-900 font-bold text-sm">Action Required</h4>
            <p className="text-red-700 text-xs mt-1 leading-relaxed">
              {vaccineDaysLeft === 0 && weighingDaysLeft === 0
                ? "It's time for vaccination and weighing. Please complete the Action Forms below."
                : vaccineDaysLeft === 0
                  ? "Vaccination is due. Please complete the Vaccination Form below."
                  : "Weighing is due. Please complete the Weighing Form below."}
            </p>
          </div>
        </div>
      )}

      {/* Growth Stage */}
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

      {/* Action Forms */}
      <div>
        <h2 className="text-[#027027] text-sm font-bold mb-3">Action Forms</h2>
        <div className="space-y-3">

          {/* Vaccine Form */}
          <div className={`border rounded-2xl p-4 flex justify-between items-center shadow-sm transition ${vaccineDaysLeft === 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${vaccineDaysLeft === 0 ? 'bg-red-100 text-red-600' : 'bg-green-50 text-[#027027]'}`}>
                <Syringe size={18} />
              </div>
              <div>
                <span className={`text-sm font-bold ${vaccineDaysLeft === 0 ? 'text-red-900' : 'text-gray-800'}`}>Vaccination Form</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {vaccineDaysLeft === 0 ? "Due today — tap to fill form" : `Next in ${vaccineDaysLeft} days`}
                </span>
                {activeKid.vaccineRecords?.length > 0 && (
                  <span className="block text-[10px] text-[#027027] mt-1 font-semibold">
                    Last: {activeKid.vaccineRecords[activeKid.vaccineRecords.length-1].vaccineName}
                  </span>
                )}
              </div>
            </div>
            
            <button onClick={() => openForm("vaccine")} className={`${vaccineDaysLeft === 0 ? 'bg-[#027027] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 shadow-sm`}>
              Open Form
            </button>
            
          </div>

          {/* Weighing Form */}
          <div className={`border rounded-2xl p-4 flex justify-between items-center shadow-sm transition ${weighingDaysLeft === 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${weighingDaysLeft === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                <Activity size={18} />
              </div>
              <div>
                <span className={`text-sm font-bold ${weighingDaysLeft === 0 ? 'text-red-900' : 'text-gray-800'}`}>Weighing Form</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {weighingDaysLeft === 0 ? "Due today — tap to fill form" : `Next in ${weighingDaysLeft} days`}
                </span>
                {activeKid.weight && <span className="block text-[10px] text-[#027027] mt-1 font-semibold">Last Weight: {activeKid.weight} kg</span>}
              </div>
            </div>
            
            <button onClick={() => openForm("weighing")} className={`${weighingDaysLeft === 0 ? 'bg-[#027027] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 shadow-sm`}>
              Open Form
            </button>
            
          </div>

        </div>
      </div>

    </div>
  );
}
