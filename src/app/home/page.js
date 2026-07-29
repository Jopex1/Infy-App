"use client";
import Carousel from "@/components/Carousel";
import { CalendarCheck, Activity, Footprints, Grid, ChevronRight, Syringe, Baby } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useChildren } from "@/hooks/useChildren";

export default function Home() {
  const { kids } = useChildren();
  const [activeKidIndex, setActiveKidIndex] = useState(0);

  const nextKid = () => setActiveKidIndex((prev) => (prev + 1) % kids.length);
  const activeKid = kids.length > 0 ? kids[activeKidIndex] : null;

  const tips = [
    { title: "Tummy Time", desc: "Start tummy time early. Even 3–5 minutes a day helps strengthen neck and shoulder muscles.", link: "https://raisingchildren.net.au/newborns/play-learning/play-ideas/tummy-time" },
    { title: "Sleep Routine", desc: "Establish a consistent bedtime routine. Bath, book, and bed can work wonders.", link: "https://raisingchildren.net.au/newborns/sleep/settling-routines/newborn-sleep-routines" },
    { title: "Nutritional Needs", desc: "Breastmilk or formula provides all the nutrients a child needs for the first 6 months.", link: "https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding" },
    { title: "Language Skills", desc: "Talk, read, and sing to your baby constantly to build their vocabulary.", link: "https://raisingchildren.net.au/babies/development/language-development/language-3-12-months" },
    { title: "Vaccination", desc: "Keep track of scheduled immunizations. They are critical for your baby's immune defense.", link: "https://www.cdc.gov/vaccines/by-age/index.html" },
    { title: "Motor Skills", desc: "Provide safe objects to grasp to improve hand-eye coordination.", link: "https://www.unicef.org/parenting/child-development/baby-milestones-your-child-active-play" },
    { title: "Teething Relief", desc: "A cold teething ring can soothe sore gums when those first teeth emerge.", link: "https://www.texaschildrens.org/content/wellness/teething-tips-new-information-parents" },
    { title: "Solid Foods", desc: "Introduce solids one at a time to monitor for any potential allergies.", link: "https://www.nhs.uk/baby/weaning-and-feeding/babys-first-solid-foods/" },
    { title: "Baby Proofing", desc: "Cover sharp edges and secure cabinets before your baby starts crawling.", link: "https://www.unicef.org/parenting/safety/how-to-babyproof-your-home" },
    { title: "Self Care", desc: "Don't forget to take care of yourself. A rested parent is a happy parent!", link: "https://www.unicef.org/parenting/mental-health/parent-self-care-tips" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500 min-h-screen pb-safe">

      {/* Carousel - edge to edge, no horizontal padding */}
      <section className="pt-4 -mx-0 overflow-hidden">
        <Carousel tips={tips} />
      </section>

      {/* Visual Guide Section */}
      <section className="px-4 border-t border-gray-100 pt-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Visual Guide to Parenting</h2>
        <div className="flex bg-orange-50 rounded-[2rem] p-5 items-center shadow-sm border border-orange-100 gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Explore guides on nutrition, vaccines, and your child's daily development.
            </p>
            <Link href="/explore">
              <button className="bg-[#027027] hover:bg-green-800 transition rounded-full px-5 py-2.5 text-white font-bold flex items-center justify-center w-full shadow-lg active:scale-95 text-sm gap-2">
                Start Exploring
              </button>
            </Link>
          </div>
          <Link href="/explore" className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center text-[#027027] shadow-inner flex-shrink-0 active:scale-95 transition">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </Link>
        </div>
      </section>

      {/* My Baby's Dashboard CTA */}
      <section className="px-4">
        <div className="bg-green-50 border border-green-200 rounded-[20px] p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 text-[#027027] opacity-10 pointer-events-none">
            <Baby size={120} />
          </div>

          <div className="bg-white border border-green-200 rounded-[20px] p-4 px-6 shadow-sm mb-5 relative z-10">
            <div className="text-sm text-gray-600">
              <strong className="text-[#027027] text-[15px] block mb-1">Keep Track of Every Milestone</strong>
              Monitor your child's growth, weighing schedule, vaccinations, and important health information all in one place.
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 mb-6 relative z-10 text-[#027027]">
            <Link href="/kids" className="flex flex-col items-center active:scale-95 transition"><Syringe size={32} /></Link>
            <div className="w-[2px] h-8 bg-green-300"></div>
            <Link href="/kids" className="flex flex-col items-center active:scale-95 transition"><CalendarCheck size={32} /></Link>
            <div className="w-[2px] h-8 bg-green-300"></div>
            <Link href="/kids" className="flex flex-col items-center active:scale-95 transition"><Baby size={32} /></Link>
          </div>

          <Link href="/kids" className="relative z-10 flex justify-center items-center gap-2 w-full bg-[#027027] hover:bg-[#014d1a] transition py-3.5 rounded-xl text-white font-bold text-sm shadow-md active:scale-95">
            Go to Dashboard
          </Link>
        </div>
      </section>

    </div>
  );
}
