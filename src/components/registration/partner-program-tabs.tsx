"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnerProgramApplicationForm } from "@/components/registration/partner-program-application-form";

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
      <div className="mb-4 flex w-fit max-w-full flex-wrap gap-1 rounded-lg border border-border/50 bg-muted p-1">
        {PARTNER_TYPES.map((type) => (
          <Button
            key={type.id}
            type="button"
            size="sm"
            variant={type.id === activeId ? "default" : "ghost"}
            className={type.id === activeId ? "" : "border border-border/50"}
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
        <Button
          variant="outline"
          size="sm"
          className="mb-6 w-full sm:w-auto"
          nativeButton={false}
          render={
            <Link href="/partner-program/certificate">
              <Download className="size-4" />
              Download your certificate
            </Link>
          }
        />
      ) : null}

      <h1 className="mb-1 text-xl font-bold">{active.heading}</h1>
      <p className="text-muted-foreground mb-6 text-sm">{active.description}</p>

      <PartnerProgramApplicationForm
        key={activeId}
        partnerType={activeId}
        referrerOptions={referrerOptions}
        referrerLabel={referrerLabel}
      />
    </div>
  );
}
