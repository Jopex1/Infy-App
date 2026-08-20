"use client";
import { useState, useEffect } from "react";
import { useChildren } from "@/hooks/useChildren";
import { ChevronDown, ChevronUp } from "lucide-react";

function getGrowthStage(dob) {
  if (!dob) return "Newborn";
  const now = new Date();
  const birth = new Date(dob);
  const diffMs = now.getTime() - birth.getTime();
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 3) return "Newborn";
  if (months < 12) return "Infant";
  return "Toddler";
}

const stageData = {
  Newborn: {
    range: "Birth to 3 months",
    emoji: "👶",
    color: "bg-pink-50 border-pink-200",
    badge: "bg-pink-100 text-pink-700",
    description: "Babies spend most of their time sleeping, rely on reflexes such as sucking and rooting, and begin recognising familiar voices and faces.",
    videos: [
      { id: "JvmTlvBUhuQ" },
      { id: "9RVvxFNhHdI" },
    ],
    sections: [
      { title: "Sleep & Rest", content: "Newborns sleep 14–17 hours a day in short cycles. Always place baby on their back to sleep on a firm surface." },
      { title: "Feeding", content: "Breastmilk or formula provides all nutrients needed. Feed every 2–3 hours or on demand. Watch for hunger cues like rooting and sucking motions." },
      { title: "Development Milestones", content: "Responds to sounds and familiar voices. Can focus on faces 8–12 inches away. Grasp reflex is present. Tummy time helps strengthen neck and shoulder muscles." },
      { title: "When to See a Doctor", content: "Seek medical advice if baby has a fever above 38°C, is not feeding well, has unusual crying, or has yellowing skin beyond 2 weeks." },
    ],
  },
  Infant: {
    range: "3 to 12 months",
    emoji: "🍼",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    description: "Babies learn to roll over, sit, crawl and stand. They begin babbling, saying words like 'mama' and 'dada', and become aware of strangers.",
    videos: [
      { id: "3F4XH7ACWOY" },
      { id: "Oe0hfVNfLAI" },
    ],
    sections: [
      { title: "Motor Skills", content: "Rolls over at 4–5 months, sits without support at 6–7 months. Starts crawling around 8–9 months. May begin pulling to stand near 9–12 months." },
      { title: "Feeding & Solids", content: "Breast or formula continues. Introduce single-ingredient solids around 6 months. Introduce one new food at a time to detect allergies." },
      { title: "Social & Language", content: "Babbles and laughs. Responds to own name by 6 months. Starts saying mama/dada around 9–12 months. Waves bye-bye and shows stranger anxiety." },
      { title: "Vaccinations at This Stage", content: "Key vaccines are scheduled at 6 weeks, 10 weeks, 14 weeks, 6 months, and 9 months. Always follow your clinic's vaccination schedule." },
    ],
  },
  Toddler: {
    range: "1 to 3 years",
    emoji: "🧒",
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700",
    description: "Toddlers begin walking independently, become highly active, develop speech rapidly, and start showing confidence and independence.",
    videos: [
      { id: "3F4XH7ACWOY" },
      { id: "VVmMK4ZcPxY" },
    ],
    sections: [
      { title: "Movement & Activity", content: "Walks independently by 12–15 months. Runs, climbs, and becomes highly active. Hand-eye coordination improves rapidly. Start toddler-proofing your home." },
      { title: "Language Development", content: "Says 2–3 words by 12 months, short sentences by 2 years. Reading aloud, singing, and talking constantly accelerates vocabulary growth." },
      { title: "Behaviour & Independence", content: "Toddlers begin asserting independence, which can lead to tantrums. Set consistent boundaries with warmth. Encourage exploration in safe spaces." },
      { title: "Nutrition", content: "Transition to family foods. Offer a variety of fruits, vegetables, proteins, and grains. Limit sugar and processed foods. Maintain regular mealtimes." },
    ],
  },
};

function Accordion({ title, content }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-5 py-4 text-left font-bold text-gray-800 text-sm"
      >
        {title}
        {open ? <ChevronUp size={18} className="text-[#027027]" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-in fade-in duration-200">
          {content}
        </div>
      )}
    </div>
  );
}

export default function LearnMore() {
  const [stageLabel, setStageLabel] = useState("Newborn");
  const [videoTitles, setVideoTitles] = useState({});

  useEffect(() => {
    const kids = localStorage.getItem("infy_kids");
    if (kids) {
      const parsed = JSON.parse(kids);
      if (parsed.length > 0) {
        const stage = getGrowthStage(parsed[0].dob);
        setStageLabel(stage);
      }
    }
  }, []);

  useEffect(() => {
    const ids = [...new Set(Object.values(stageData).flatMap((s) => s.videos.map((v) => v.id)))];
    fetch("/api/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => setVideoTitles(data.titles || {}))
      .catch(() => {});
  }, []);

  const stage = stageData[stageLabel];
  const getTitle = (video) => videoTitles[video.id] || "Loading title…";

  return (
    <div className="min-h-screen pb-safe">

      {/* Header */}
      <div className="pt-6 pb-4 px-6 flex items-center gap-4">
        <div className="text-4xl">{stage.emoji}</div>
        <div>
          <h1 className="text-gray-900 text-2xl font-bold leading-tight">{stageLabel} Stage</h1>
          <p className="text-gray-500 text-sm mt-0.5">{stage.range}</p>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">

        {/* Description */}
        <div className={`${stage.color} border rounded-3xl p-5 shadow-sm`}>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.badge} mb-2 inline-block`}>{stage.range}</span>
          <p className="text-sm text-gray-700 leading-relaxed">{stage.description}</p>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#027027] uppercase tracking-wide">Key Information</h2>
          {stage.sections.map((s, i) => (
            <Accordion key={i} title={s.title} content={s.content} />
          ))}
        </div>

        {/* Educational Videos */}
        <div>
          <h2 className="text-sm font-bold text-[#027027] uppercase tracking-wide mb-3">Educational Videos</h2>
          <div className="space-y-4">
            {stage.videos.map((v, i) => (
              <div key={i} className="rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="bg-gray-50 px-4 py-2.5">
                  <p className="text-sm font-bold text-gray-700">{getTitle(v)}</p>
                </div>
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}?controls=1&autohide=0&rel=0&modestbranding=1&fs=1&playsinline=1`}
                    title={getTitle(v)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    tabIndex="0"
                    className="w-full h-full touch-manipulation"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
