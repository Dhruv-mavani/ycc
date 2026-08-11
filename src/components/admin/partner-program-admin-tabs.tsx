"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PartnerProgramApplicationsList } from "@/components/admin/partner-program-applications-list";
import type { PartnerApplicationStatus, PartnerType } from "@/lib/supabase/types";

interface PartnerProgramApplication {
  id: string;
  name: string;
  email: string;
  college_id: string | null;
  collegeName: string;
  stream: string | null;
  semester: string | null;
  mobile: string;
  instagram_handle: string;
  referred_by: string | null;
  agreement_q1: string;
  agreement_q2: string;
  agreement_q3: string;
  partner_type: PartnerType;
  status: PartnerApplicationStatus;
  referred_by_id: string | null;
  referredByName: string | null;
  created_at: string;
}

const PARTNER_TYPES = [
  { id: "campus", label: "Campus Partner" },
  { id: "class", label: "Class Partner" },
  { id: "classmate", label: "Classmate Partner" },
] as const;

const HIERARCHY_NOTE: Record<(typeof PARTNER_TYPES)[number]["id"], string> = {
  campus: "Campus Partners are approved by an admin here.",
  class: "Class Partners are normally approved by the Campus Partner who referred them — you can override that below.",
  classmate: "Classmate Partners are normally approved by the Class Partner who referred them — you can override that below.",
};

export function PartnerProgramAdminTabs({
  applications,
  colleges,
}: {
  applications: PartnerProgramApplication[];
  colleges: { id: string; name: string }[];
}) {
  const [activeId, setActiveId] =
    useState<(typeof PARTNER_TYPES)[number]["id"]>("campus");

  const filteredApplications = applications.filter(
    (app) => app.partner_type === activeId,
  );

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
      <p className="text-muted-foreground text-xs">{HIERARCHY_NOTE[activeId]}</p>

      <PartnerProgramApplicationsList
        key={activeId}
        applications={filteredApplications}
        activeType={activeId}
        colleges={colleges}
      />
    </div>
  );
}
