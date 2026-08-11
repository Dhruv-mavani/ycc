"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const images = [
  "/carousel/img_1.jpg",
  "/carousel/img_2.jpg",
  "/carousel/img_3.jpg",
  "/carousel/img_4.png",
  "/carousel/img_5.jpg",
  "/carousel/img_6.jpg",
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5000); // Auto-crossfade every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const showPrev = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <div 
      className="absolute inset-0 -z-20 h-full w-full group overflow-hidden bg-background"
      style={{ WebkitMaskImage: "linear-gradient(to bottom, white 70%, transparent 100%)", maskImage: "linear-gradient(to bottom, white 70%, transparent 100%)" }}
    >
      {/* Images Container */}
      {images.map((src, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={src}
            alt={`Carousel image ${idx + 1}`}
            fill
            className={`object-cover transition-transform duration-[10000ms] ease-out ${
              idx === activeIndex ? "scale-110" : "scale-100"
            }`}
            priority={idx === 0}
          />
        </div>
      ))}

      {/* Navigation Buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-background/50 backdrop-blur-sm pointer-events-auto hover:bg-background"
          onClick={showPrev}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-background/50 backdrop-blur-sm pointer-events-auto hover:bg-background"
          onClick={showNext}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>


    </div>
  );
}
