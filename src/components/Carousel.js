"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Carousel({ tips }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const isResetting = useRef(false);

  // Duplicate tips for seamless infinite loop: [original + original]
  const loopedTips = [...tips, ...tips];

  const scrollToIndex = (index, smooth = true) => {
    if (!scrollRef.current) return;
    const el = scrollRef.current.children[index];
    if (el) {
      const scrollParent = scrollRef.current;
      const scrollLeft = el.offsetLeft - (scrollParent.offsetWidth / 2) + (el.offsetWidth / 2);
      scrollParent.scrollTo({
        left: scrollLeft,
        behavior: smooth ? "smooth" : "auto"
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;

        if (next >= loopedTips.length) {
          // Silently jump to first original item (index 0) then continue
          isResetting.current = true;
          setTimeout(() => {
            scrollToIndex(0, false);
            isResetting.current = false;
          }, 10);
          return 0;
        }

        scrollToIndex(next, true);
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [loopedTips.length]);

  const handleScroll = () => {
    if (!scrollRef.current || isResetting.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const itemWidth = scrollRef.current.children[0]?.offsetWidth || 1;
    const index = Math.round(scrollLeft / itemWidth);
    setCurrentIndex(Math.min(index, loopedTips.length - 1));
  };

  // Real index for dots (maps back to original tips)
  const dotIndex = currentIndex % tips.length;

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
      >
        {loopedTips.map((tip, i) => {
          const cardColors = ["bg-[#027027]", "bg-blue-600", "bg-amber-600", "bg-purple-600", "bg-rose-600"];
          return (
          <div
            key={i}
            className={`flex-shrink-0 snap-center rounded-3xl ${cardColors[i % cardColors.length]} h-36 shadow-xl relative flex flex-col justify-center p-5 text-white overflow-hidden`}
            style={{
              width: "82%",
              marginLeft: i === 0 ? "9%" : "0",
              marginRight: i === loopedTips.length - 1 ? "9%" : "0",
            }}
          >
            {/* Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] rounded-3xl pointer-events-none" />

            {/* Logo watermark top-right clipped */}
            <div className="absolute -top-4 -right-2 opacity-15 w-32 h-20 pointer-events-none">
              <Image src="/icons/infy_wordmark_mono_1.png" alt="Infy" fill className="object-contain object-right" />
            </div>

            <h3 className="text-base font-bold mb-1 drop-shadow-sm pr-10 relative z-10">{tip.title}</h3>
            <p className="text-xs opacity-85 leading-relaxed line-clamp-3 relative z-10">{tip.desc}</p>
          </div>
          );
        })}
      </div>

      {/* Pagination Dots — based on original tips only */}
      <div className="flex justify-center mt-3 gap-[6px]">
        {tips.map((_, i) => {
          const cardColors = ["bg-[#027027]", "bg-blue-600", "bg-amber-600", "bg-purple-600", "bg-rose-600"];
          return (
          <button key={i}
            onClick={() => { setCurrentIndex(i); scrollToIndex(i); }}
            className={`rounded-full transition-all ${i === dotIndex ? `w-5 h-2 ${cardColors[i % cardColors.length]}` : "w-2 h-2 bg-gray-300"}`}
          />
          );
        })}
      </div>

      <style>{`.snap-center { scroll-snap-align: center; }`}</style>
    </div>
  );
}
