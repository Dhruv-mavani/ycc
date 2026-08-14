"use client";

import { useRef, useState, useEffect } from "react";
import { Trophy, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    icon: Trophy,
    color: "blue",
    title: "Unmatched Scale & Professionalism",
    description: "Experience stadium-like energy, professional umpiring, and top-tier digital broadcasting. We elevate local cricket to international standards, ensuring every match feels like a grand finale."
  },
  {
    icon: Star,
    color: "emerald",
    title: "Massive Rewards & Recognition",
    description: "Compete for substantial cash prizes, massive custom trophies, and the spotlight you deserve. Stand out and get recognized by scouts, sponsors, and a massive online audience."
  },
  {
    icon: Users,
    color: "indigo",
    title: "Community & Culture",
    description: "Join a passionate, highly engaged network of athletes and fans. It's not just about winning; it's about the spirit of the game and forging lifelong connections on and off the pitch."
  }
];

export function WhyChooseCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const scrollLeft = scrollRef.current.scrollLeft;
      const itemWidth = scrollRef.current.offsetWidth;
      // Calculate which item is most in view
      const newIndex = Math.round(scrollLeft / itemWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    };
    
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [activeIndex]);

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const itemWidth = scrollRef.current.offsetWidth;
    scrollRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    });
  };

  // Auto-scroll every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % CARDS.length;
      scrollTo(nextIndex);
    }, 10000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <div className="w-full max-w-6xl overflow-hidden mx-auto relative group py-12 md:py-16">
      
      {/* Desktop Backdrop Glow */}
      <div className="hidden md:block absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] rounded-[3rem] pointer-events-none"></div>

      {/* Scrollable Container with edge fading for large screens */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10 w-full md:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        {CARDS.map((card, i) => {
          const isActive = i === activeIndex;
          const Icon = card.icon;
          
          return (
            <div 
              key={i} 
              className="w-full sm:w-[85%] md:w-[70%] lg:w-[60%] shrink-0 snap-center flex items-center justify-center px-4 transition-all duration-500 ease-out"
              style={{
                 transform: isActive ? 'scale(1)' : 'scale(0.88)',
                 opacity: isActive ? 1 : 0.3,
              }}
            >
              <div className={cn(
                "w-full bg-slate-900/90 backdrop-blur-xl border p-6 sm:p-8 md:p-12 rounded-3xl relative overflow-hidden transition-all duration-500",
                isActive ? "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] border-slate-700/60" : "shadow-none border-transparent"
              )}>
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 rounded-full blur-3xl transition-all duration-700",
                  isActive ? "opacity-20 scale-100" : "opacity-0 scale-50",
                  card.color === "blue" && "bg-blue-500",
                  card.color === "emerald" && "bg-emerald-500",
                  card.color === "indigo" && "bg-indigo-500"
                )}></div>
                
                <div className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 border transition-colors duration-500",
                  card.color === "blue" && "bg-blue-500/20 border-blue-500/30 text-blue-400",
                  card.color === "emerald" && "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
                  card.color === "indigo" && "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                )}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                
                <h3 className="text-xl min-[320px]:text-2xl md:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">{card.title}</h3>
                <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed font-medium">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-3 mt-10">
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-2.5 rounded-full transition-all duration-500 ease-out",
              i === activeIndex ? "bg-emerald-400 w-10 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-slate-700 w-2.5 hover:bg-slate-600"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
