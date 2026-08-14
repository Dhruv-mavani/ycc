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

  // Auto-scroll every 10 seconds (only on mobile)
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth < 1024) {
        const nextIndex = (activeIndex + 1) % CARDS.length;
        scrollTo(nextIndex);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <div className="w-full max-w-6xl mx-auto relative group py-12 md:py-16 px-4">
      
      {/* Desktop Backdrop Glow */}
      <div className="hidden lg:block absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] rounded-[3rem] pointer-events-none"></div>

      {/* Scrollable Container (Flex Carousel on Mobile, CSS Grid on Desktop) */}
      <div 
        ref={scrollRef}
        className="flex lg:grid lg:grid-cols-3 gap-6 lg:gap-8 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10 w-full"
      >
        {CARDS.map((card, i) => {
          const isActive = i === activeIndex;
          const Icon = card.icon;
          
          return (
            <div 
              key={i} 
              className={cn(
                "w-full sm:w-[85%] md:w-[70%] lg:w-auto shrink-0 snap-center transition-all duration-500 ease-out",
                isActive ? "scale-100 opacity-100" : "scale-90 opacity-30 lg:scale-100 lg:opacity-100"
              )}
            >
              <div className={cn(
                "w-full h-full bg-white border border-slate-200 p-6 sm:p-8 md:p-10 rounded-3xl relative overflow-hidden transition-all duration-500",
                isActive ? "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border-slate-300" : "shadow-none border-transparent lg:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] lg:border-slate-300"
              )}>
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 rounded-full blur-3xl transition-all duration-700",
                  isActive ? "opacity-20 scale-100" : "opacity-0 scale-50 lg:opacity-20 lg:scale-100",
                  card.color === "blue" && "bg-blue-400",
                  card.color === "emerald" && "bg-emerald-400",
                  card.color === "indigo" && "bg-indigo-400"
                )}></div>
                
                <div className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 border transition-colors duration-500 relative z-10",
                  card.color === "blue" && "bg-blue-50 border-blue-200 text-blue-600",
                  card.color === "emerald" && "bg-emerald-50 border-emerald-200 text-emerald-600",
                  card.color === "indigo" && "bg-indigo-50 border-indigo-200 text-indigo-600"
                )}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                
                <h3 className="text-xl min-[320px]:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight relative z-10">{card.title}</h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium relative z-10">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots (Mobile Only) */}
      <div className="flex lg:hidden justify-center gap-3 mt-10">
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-2.5 rounded-full transition-all duration-500 ease-out",
              i === activeIndex ? "bg-emerald-500 w-10 shadow-sm" : "bg-slate-200 w-2.5 hover:bg-slate-300"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
