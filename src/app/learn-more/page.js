"use client";
import { useState, useEffect } from "react";
import { Play, MoreVertical, Share2, MessageCircle, Bookmark, ChevronRight, ChevronDown, ChevronUp, X } from "lucide-react";
import { useRouter } from "next/navigation";

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
    range: "0–3 months",
    emoji: "👶",
    color: "bg-pink-50 border-pink-200",
    badge: "bg-pink-100 text-pink-700",
    shortDescription: "Babies spend most of their time sleeping and feeding. They begin recognising familiar voices and faces, responding to sounds and touch, and slowly developing control over their movements.",
    fullDescription: "During the first three months, babies are adjusting to life outside the womb. They need frequent feeding, plenty of sleep and close care from parents or caregivers. They may begin looking at faces, responding to familiar voices, making small sounds and moving their arms and legs more actively.\n\nBabies develop at different speeds, so parents should focus on their child's progress rather than comparing them with other babies. Talking, singing, smiling and holding the baby can support early learning and bonding.\n\nParents should also pay attention to feeding, sleep, growth and changes in the baby's behaviour. Regular health visits are important for monitoring the baby's growth and receiving recommended vaccinations.",
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
  },
  Infant: {
    range: "4–12 months",
    emoji: "🍼",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    shortDescription: "Babies become more active and curious during this stage. They begin reaching for objects, making more sounds, sitting and exploring the world around them.",
    fullDescription: "Between 4 and 12 months, babies develop many new physical, communication and social skills. They become more interested in people, objects and their surroundings.\n\nThey may begin rolling, sitting, reaching for objects, making different sounds and eventually moving around more independently.\n\nAround 6 months, appropriate complementary foods can be introduced while breastfeeding continues. This is also an important period for growth monitoring, vaccinations and other scheduled child-health activities.\n\nParents can support development by talking, singing, reading, playing and responding to the baby's sounds and movements.",
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
  },
  Toddler: {
    range: "1–3 years",
    emoji: "🧒",
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700",
    shortDescription: "Toddlers are becoming more independent. They learn through talking, playing and exploring while developing stronger movement, language and social skills.",
    fullDescription: "Between 1 and 3 years, children become more active and curious. They may walk, run, climb, use more words and begin doing simple things by themselves.\n\nToddlers learn mainly through everyday activities and play. Talking with them, reading, singing, naming objects and allowing safe exploration can support their development.\n\nThey may also begin showing stronger emotions and wanting to do things independently. Parents should provide guidance while allowing the child to practise safe independence.\n\nNutrition, vaccinations, growth monitoring and regular health visits remain important during this stage.",
    videos: [
      { id: "YD-f1iWkvhw", title: "Toddler Development", description: "Learn about your toddler's growing movement, communication, social skills and independence." },
      { id: "YD-f1iWkvhw", title: "Care for Child Development", description: "Learn how parents and caregivers can use play, communication and everyday activities to support a young child's development." },
      { id: "YD-f1iWkvhw", title: "Learning Through Play", description: "Learn how simple games and everyday play can help toddlers develop thinking, language, movement and social skills." },
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
  },
};

function DescriptionCard({ color, badge, range, shortDescription, fullDescription }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`${color} border rounded-3xl p-5 shadow-sm`}>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge} mb-2 inline-block`}>{range}</span>
      <p className="text-sm text-gray-700 leading-relaxed">
        {expanded ? (
          <>
            {fullDescription.split("\n\n").map((para, i) => (
              <span key={i}>{para}{i < fullDescription.split("\n\n").length - 1 && <><br /><br /></>}</span>
            ))}
            {" "}
            <button onClick={() => setExpanded(false)} className="text-[#027027] font-bold text-xs">Read Less</button>
          </>
        ) : (
          <>
            {shortDescription}{" "}
            <button onClick={() => setExpanded(true)} className="text-[#027027] font-bold text-xs">Read More</button>
          </>
        )}
      </p>
    </div>
  );
}

function Accordion({ title, short, full }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => { setOpen(!open); if (!open) setExpanded(false); }}
        className="w-full flex justify-between items-center px-5 py-4 text-left font-bold text-gray-800 text-sm"
      >
        {title}
        {open ? <ChevronUp size={18} className="text-[#027027]" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-in fade-in duration-200">
          {expanded ? (
            <>
              {full.split("\n\n").map((para, i) => (
                <p key={i} className={i > 0 ? "mt-3" : ""}>{para}</p>
              ))}
              <button onClick={() => setExpanded(false)} className="mt-3 text-[#027027] font-bold text-xs block">Read Less</button>
            </>
          ) : (
            <>
              <p>{short}</p>
              <button onClick={() => setExpanded(true)} className="mt-2 text-[#027027] font-bold text-xs block">Read More</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function LearnMore() {
  const router = useRouter();
  const [stageLabel, setStageLabel] = useState("Newborn");
  const [menuOpen, setMenuOpen] = useState(null);
  const [activeVideoKey, setActiveVideoKey] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const kids = localStorage.getItem("infy_kids");
    if (kids) {
      const parsed = JSON.parse(kids);
      if (parsed.length > 0) {
        const stage = getGrowthStage(parsed[0].dob);
        setStageLabel(stage);
      }
    }
    setWatchlist(JSON.parse(localStorage.getItem("infy_watchlist") || "[]"));
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen !== null ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  const stage = stageData[stageLabel];

  const getCardKey = (v, i) => `${v.id}_${i}`;

  const handleAskInfyAI = (v) => {
    const videoLink = `https://www.youtube.com/watch?v=${v.id}`;
    localStorage.setItem("infy_ai_video", JSON.stringify({ link: videoLink, title: v.title, description: v.description }));
    router.push("/chat");
    setMenuOpen(null);
  };

  const handleShare = async (v) => {
    const videoLink = `https://www.youtube.com/watch?v=${v.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: v.title, text: `Watch: ${v.title}`, url: videoLink }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(videoLink);
      alert("Link copied to clipboard!");
    }
    setMenuOpen(null);
  };

  const handleWatchOnYouTube = (v) => {
    window.open(`https://www.youtube.com/watch?v=${v.id}`, "_blank");
    setMenuOpen(null);
  };

  const toggleWatchlist = (v, key) => {
    let current = [...watchlist];
    const index = current.findIndex(w => w.id === v.id && w.key === key);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push({ id: v.id, key, title: v.title, addedAt: new Date().toISOString() });
      const notifs = JSON.parse(localStorage.getItem("infy_notifications") || "[]");
      notifs.unshift({ id: `wl_${Date.now()}`, title: "Video Added to Watchlist", desc: `"${v.title}" was added to your watchlist.`, time: "Just now", unread: true, type: "watchlist", timestamp: Date.now() });
      localStorage.setItem("infy_notifications", JSON.stringify(notifs));
      window.dispatchEvent(new Event("storage"));
    }
    setWatchlist(current);
    localStorage.setItem("infy_watchlist", JSON.stringify(current));
    setMenuOpen(null);
  };

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

      <div className="px-4 pt-2 space-y-5">

        {/* Description */}
        <DescriptionCard
          color={stage.color}
          badge={stage.badge}
          range={stage.range}
          shortDescription={stage.shortDescription}
          fullDescription={stage.fullDescription}
        />

        {/* Accordion Sections */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#027027] uppercase tracking-wide">Key Information</h2>
          {stage.sections.map((s, i) => (
            <Accordion key={i} title={s.title} short={s.short} full={s.full} />
          ))}
        </div>

        {/* Educational Videos */}
        <div>
          <h2 className="text-sm font-bold text-[#027027] uppercase tracking-wide mb-3">Educational Videos</h2>
          <div className="space-y-4">
            {menuOpen !== null && (
              <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={() => setMenuOpen(null)} onTouchStart={() => setMenuOpen(null)} />
            )}
            {stage.videos.map((v, i) => {
              const cardKey = getCardKey(v, i);
              const isActive = activeVideoKey === cardKey;
              const inWatchlist = watchlist.some(w => w.key === cardKey);
              return (
                <div key={i} className="bg-white rounded-[20px] shadow-sm border border-green-200 flex flex-col relative">
                  {/* Thumbnail / Player */}
                  <div className="aspect-video w-full relative bg-gray-900 rounded-t-[20px] overflow-hidden">
                    {isActive ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&controls=1&autohide=0&playsinline=1&fs=1`}
                        title={v.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        tabIndex="0"
                        className="w-full h-full touch-manipulation"
                      />
                    ) : (
                      <>
                        <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setActiveVideoKey(cardKey)} className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition">
                            <Play size={24} className="text-green-600 fill-green-600 ml-1" />
                          </div>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 relative">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 leading-tight flex-1 pr-2 text-sm">{v.title}</h3>
                      <div className="relative z-50">
                        <button onClick={() => setMenuOpen(menuOpen === i ? null : i)} className="text-gray-400 hover:text-gray-600 transition p-1">
                          <MoreVertical size={20} />
                        </button>

                        {menuOpen === i && (
                          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setMenuOpen(null)}>
                            <div className="bg-white rounded-[20px] shadow-xl border border-green-200 p-5 w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 text-lg">Video Options</h3>
                                <button onClick={() => setMenuOpen(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition"><X size={20} /></button>
                              </div>

                              <button onClick={() => handleWatchOnYouTube(v)} className="w-full bg-white border border-green-200 rounded-[16px] p-3 shadow-sm flex items-center gap-4 hover:shadow-md transition relative z-10 mb-3 group">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>
                                <div className="flex-1 text-left"><h4 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">Watch on YouTube</h4><p className="text-xs text-gray-500 leading-tight">Open this video on YouTube</p></div>
                                <ChevronRight size={16} className="text-gray-400" />
                              </button>

                              <button onClick={() => handleShare(v)} className="w-full bg-white border border-green-200 rounded-[16px] p-3 shadow-sm flex items-center gap-4 hover:shadow-md transition relative z-10 mb-3 group">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0"><Share2 size={20} strokeWidth={2.5} /></div>
                                <div className="flex-1 text-left"><h4 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">Share</h4><p className="text-xs text-gray-500 leading-tight">Share this video with others</p></div>
                                <ChevronRight size={16} className="text-gray-400" />
                              </button>

                              <button onClick={() => handleAskInfyAI(v)} className="w-full bg-white border border-green-200 rounded-[16px] p-3 shadow-sm flex items-center gap-4 hover:shadow-md transition relative z-10 mb-4 group">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#027027] flex-shrink-0"><MessageCircle size={20} strokeWidth={2.5} /></div>
                                <div className="flex-1 text-left"><h4 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">Ask Infy AI</h4><p className="text-xs text-gray-500 leading-tight">Get AI-powered answers</p></div>
                                <ChevronRight size={16} className="text-gray-400" />
                              </button>

                              <button onClick={() => toggleWatchlist(v, cardKey)} className="relative z-10 flex justify-center items-center gap-2 w-full bg-[#027027] hover:bg-[#014d1a] transition py-3.5 rounded-xl text-white font-bold text-sm shadow-md active:scale-95">
                                <Bookmark size={18} fill={inWatchlist ? "currentColor" : "none"} />
                                <span>{inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-1">{v.description}</p>
                    <p className="text-xs text-gray-400">YouTube</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
