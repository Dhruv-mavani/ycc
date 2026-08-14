"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnerProgramApplicationForm } from "@/components/registration/partner-program-application-form";
import { cn } from "@/lib/utils";

interface ReferrerOption {
  id: string;
  name: string;
  team_code: string | null;
}

const PARTNER_TYPES = [
  {
    id: "campus",
    slug: "YCC-partner",
    label: "YCC Partner",
    heading: "YCC Partner Program",
    description:
      "Apply to become a YCC Partner and help us bring events to your college. Fill in your details below.",
  },
  {
    id: "class",
    slug: "YCC-Co-partner",
    label: "YCC Co-Partner",
    heading: "YCC Co-Partner Program",
    description:
      "Apply to become a YCC Co-Partner and help us bring events to your class. Fill in your details below.",
  },
  {
    id: "classmate",
    slug: "Classmate-partner",
    label: "Classmate Partner",
    heading: "Classmate Partner Program",
    description:
      "Apply to become a YCC Classmate Partner and help us bring events to your classmates. Fill in your details below.",
  },
] as const;

export function PartnerProgramTabs({
  initialType,
  campusPartners,
  classPartners,
}: {
  initialType: (typeof PARTNER_TYPES)[number]["id"];
  campusPartners: ReferrerOption[];
  classPartners: ReferrerOption[];
}) {
  const router = useRouter();
  const [activeId, setActiveId] =
    useState<(typeof PARTNER_TYPES)[number]["id"]>(initialType);
  const active = PARTNER_TYPES.find((t) => t.id === activeId)!;

  const referrerOptions =
    activeId === "class"
      ? campusPartners
      : activeId === "classmate"
        ? classPartners
        : [];
  const referrerLabel = activeId === "class" ? "YCC Partner" : "YCC Co-Partner";

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
          {active.heading.split(' ').map((word, i, arr) => 
            i === arr.length - 1 ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{word}</span> : word + " "
          )}
        </h1>
        <p className="text-slate-600 text-lg max-w-xl mx-auto">{active.description}</p>
      </div>

      <div className="mb-8 flex w-full flex-col sm:flex-row gap-2 rounded-[1.25rem] border border-slate-200/60 bg-white p-2 shadow-sm">
        {PARTNER_TYPES.map((type) => (
          <Button
            key={type.id}
            type="button"
            className={cn(
              "flex-1 rounded-xl text-sm font-semibold transition-all h-11",
              type.id === activeId 
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => {
              setActiveId(type.id);
              router.push(`/partner-program/${type.slug}`);
            }}
            aria-pressed={type.id === activeId}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {activeId !== "classmate" ? (
        <div className="flex justify-center mb-10">
          <Button
            variant="outline"
            className="rounded-full px-8 h-12 border-slate-200 shadow-sm bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all hover:scale-[1.02]"
            nativeButton={false}
            render={
              <Link href="/partner-program/certificate" className="flex items-center gap-2">
                <Download className="size-4 text-blue-600" />
                Download your certificate
              </Link>
            }
          />
        </div>
      ) : null}

      <PartnerProgramApplicationForm
        key={activeId}
        partnerType={activeId}
        referrerOptions={referrerOptions}
        referrerLabel={referrerLabel}
      />
    </div>
  );
}
