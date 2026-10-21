"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_CHANNEL_URL_OFFICIAL } from "@/lib/partner-whatsapp";
import { INSTAGRAM_URL, InstagramIcon } from "@/components/registration/event-register-cta";
import { cn } from "@/lib/utils";

// A 2-step gate wrapping a free registration form's own page (not the
// marketing /events/[slug] page — see EventRegisterCta there for the
// sibling "Register for free" CTA that already requires this same join
// before linking here). That marketing-page gate is a soft shortcut; this
// is the real one — reaching /register/[eventSlug] directly (a bookmark,
// a shared link, back/forward) still has to clear Step 1 here before the
// form fields in Step 2 (`children`) ever render.
export function RegistrationSteps({ children }: { children: React.ReactNode }) {
  const [whatsappJoined, setWhatsappJoined] = useState(false);
  const [instagramJoined, setInstagramJoined] = useState(false);
  const bothJoined = whatsappJoined && instagramJoined;
  const step = bothJoined ? 2 : 1;

  return (
    <div className="space-y-8">
      <StepIndicator step={step} />

      {bothJoined ? (
        children
      ) : (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-600">
            Join both communities to unlock the registration form
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setWhatsappJoined(true)}
              className={cn(
                "h-auto min-h-11 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 whitespace-normal leading-snug transition-colors",
                whatsappJoined
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                  : "border-slate-200 bg-white text-slate-600",
              )}
              nativeButton={false}
              render={
                <a href={WHATSAPP_CHANNEL_URL_OFFICIAL} target="_blank" rel="noopener noreferrer">
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
                "h-auto min-h-11 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 whitespace-normal leading-snug transition-colors",
                instagramJoined
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                  : "border-slate-200 bg-white text-slate-600",
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
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      <StepDot n={1} label="Join" active={step === 1} done={step > 1} />
      <div
        className={cn(
          "h-0.5 w-10 shrink-0 rounded-full transition-colors sm:w-16",
          step > 1 ? "bg-indigo-600" : "bg-slate-200",
        )}
      />
      <StepDot n={2} label="Register" active={step === 2} done={false} />
    </div>
  );
}

function StepDot({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-sm font-bold transition-colors sm:size-10",
          done
            ? "bg-indigo-600 text-white"
            : active
              ? "bg-indigo-600 text-white shadow-[0_0_0_4px_rgba(79,70,229,0.15)]"
              : "border border-slate-200 bg-white text-slate-400",
        )}
      >
        {done ? <CheckCircle2 className="size-5" /> : n}
      </div>
      <span
        className={cn(
          "text-xs font-semibold uppercase tracking-wide",
          active || done ? "text-indigo-600" : "text-slate-400",
        )}
      >
        {label}
      </span>
    </div>
  );
}
