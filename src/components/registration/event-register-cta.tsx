"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_CHANNEL_URL } from "@/lib/partner-whatsapp";
import { cn } from "@/lib/utils";

const INSTAGRAM_URL = "https://instagram.com/ycct10";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

export function EventRegisterCta({ eventSlug }: { eventSlug: string }) {
  const [whatsappJoined, setWhatsappJoined] = useState(false);
  const [instagramJoined, setInstagramJoined] = useState(false);
  const bothJoined = whatsappJoined && instagramJoined;

  return (
    <div className="space-y-3">
      <p className="text-xs sm:text-sm text-slate-500 font-medium">
        Join both communities to unlock registration
      </p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setWhatsappJoined(true)}
          className={cn(
            "h-auto min-h-10 py-2.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 whitespace-normal leading-snug transition-colors",
            whatsappJoined
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
              : "border-slate-200 text-slate-600",
          )}
          nativeButton={false}
          render={
            <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              {whatsappJoined ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <MessageCircle className="size-4 shrink-0" />
              )}
              {whatsappJoined ? "Joined" : "Join WhatsApp"}
            </a>
          }
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setInstagramJoined(true)}
          className={cn(
            "h-auto min-h-10 py-2.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 whitespace-normal leading-snug transition-colors",
            instagramJoined
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
              : "border-slate-200 text-slate-600",
          )}
          nativeButton={false}
          render={
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              {instagramJoined ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <InstagramIcon className="size-4 shrink-0" />
              )}
              {instagramJoined ? "Joined" : "Join Instagram"}
            </a>
          }
        />
      </div>

      {bothJoined ? (
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg h-14 sm:h-16 rounded-xl sm:rounded-2xl shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all px-2"
          nativeButton={false}
          render={
            <Link
              href={`/register/${eventSlug}`}
              className="flex items-center justify-center gap-2 w-full h-full text-center"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> Register Now & Pay
            </Link>
          }
        />
      ) : (
        <Button
          disabled
          className="w-full bg-slate-200 text-slate-400 font-bold text-base sm:text-lg h-14 sm:h-16 rounded-xl sm:rounded-2xl px-2 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> Register Now & Pay
        </Button>
      )}
    </div>
  );
}
