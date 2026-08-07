"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PartnerProgramApplicationForm } from "@/components/registration/partner-program-application-form";

const PARTNER_TYPES = [
  {
    id: "campus",
    label: "Campus Partner",
    heading: "Campus Partner Program",
    description:
      "Apply to become a YCC Campus Partner and help us bring events to your college. Fill in your details below.",
  },
  {
    id: "class",
    label: "Class Partner",
    heading: "Class Partner Program",
    description:
      "Apply to become a YCC Class Partner and help us bring events to your class. Fill in your details below.",
  },
  {
    id: "classmate",
    label: "Classmate Partner",
    heading: "Classmate Partner Program",
    description:
      "Apply to become a YCC Classmate Partner and help us bring events to your classmates. Fill in your details below.",
  },
] as const;

export function PartnerProgramTabs({
  colleges,
}: {
  colleges: { id: string; name: string }[];
}) {
  const [activeId, setActiveId] =
    useState<(typeof PARTNER_TYPES)[number]["id"]>("campus");
  const active = PARTNER_TYPES.find((t) => t.id === activeId)!;

  return (
    <div>
      <div className="mb-6 inline-flex rounded-lg border border-border/50 bg-muted p-1">
        {PARTNER_TYPES.map((type) => (
          <Button
            key={type.id}
            type="button"
            size="sm"
            variant={type.id === activeId ? "default" : "ghost"}
            onClick={() => setActiveId(type.id)}
            aria-pressed={type.id === activeId}
          >
            {type.label}
          </Button>
        ))}
      </div>

      <h1 className="mb-1 text-xl font-bold">{active.heading}</h1>
      <p className="text-muted-foreground mb-6 text-sm">{active.description}</p>

      <PartnerProgramApplicationForm key={activeId} colleges={colleges} />
    </div>
  );
}
