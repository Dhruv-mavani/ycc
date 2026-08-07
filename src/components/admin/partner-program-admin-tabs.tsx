"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PartnerProgramApplicationsList } from "@/components/admin/partner-program-applications-list";

interface PartnerProgramApplication {
  id: string;
  name: string;
  email: string;
  college_id: string;
  collegeName: string;
  stream: string;
  semester: string;
  mobile: string;
  instagram_handle: string;
  referred_by: string | null;
  agreement_q1: string;
  agreement_q2: string;
  agreement_q3: string;
  created_at: string;
}

const PARTNER_TYPES = [
  { id: "campus", label: "Campus Partner" },
  { id: "class", label: "Class Partner" },
  { id: "classmate", label: "Classmate Partner" },
] as const;

export function PartnerProgramAdminTabs({
  applications,
  colleges,
}: {
  applications: PartnerProgramApplication[];
  colleges: { id: string; name: string }[];
}) {
  const [activeId, setActiveId] =
    useState<(typeof PARTNER_TYPES)[number]["id"]>("campus");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Partner program applications</h1>
        <p className="text-muted-foreground text-sm">
          Campus Partner / Class Partner / Classmate Partner applications
          submitted through the public form.
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-border/50 bg-muted p-1">
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
      <p className="text-muted-foreground text-xs">
        Applications aren&apos;t tagged by type yet, so all applications are
        shown below regardless of the selected tab.
      </p>

      <PartnerProgramApplicationsList
        applications={applications}
        colleges={colleges}
      />
    </div>
  );
}
