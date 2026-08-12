"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PartnerProgramApplicationsList } from "@/components/admin/partner-program-applications-list";
import type { PartnerApplicationStatus, PartnerType } from "@/lib/supabase/types";

interface PartnerProgramApplication {
  id: string;
  name: string;
  email: string;
  mobile: string;
  instagram_handle: string;
  referred_by: string | null;
  agreed_to_terms: boolean;
  partner_type: PartnerType;
  status: PartnerApplicationStatus;
  referred_by_id: string | null;
  referredByName: string | null;
  created_at: string;
}

const PARTNER_TYPES = [
  { id: "campus", label: "YCC Partner" },
  { id: "class", label: "YCC Co-Partner" },
  { id: "classmate", label: "Classmate Partner" },
] as const;

const HIERARCHY_NOTE: Record<(typeof PARTNER_TYPES)[number]["id"], string> = {
  campus: "YCC Partners are approved by an admin here.",
  class: "YCC Co-Partners are normally approved by the YCC Partner who referred them — you can override that below.",
  classmate: "Classmate Partners are normally approved by the YCC Co-Partner who referred them — you can override that below.",
};

export function PartnerProgramAdminTabs({
  applications,
}: {
  applications: PartnerProgramApplication[];
}) {
  const [activeId, setActiveId] =
    useState<(typeof PARTNER_TYPES)[number]["id"]>("campus");

  const filteredApplications = applications.filter(
    (app) => app.partner_type === activeId,
  );

  // Groups YCC Co-Partners under the YCC Partner who referred them, so the
  // admin can see each YCC Partner's full recruited roster and count.
  const coPartnersByPartnerId = useMemo(() => {
    const map = new Map<string, PartnerProgramApplication[]>();
    for (const app of applications) {
      if (app.partner_type !== "class" || !app.referred_by_id) continue;
      const list = map.get(app.referred_by_id) ?? [];
      list.push(app);
      map.set(app.referred_by_id, list);
    }
    return map;
  }, [applications]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Partner program applications</h1>
        <p className="text-muted-foreground text-sm">
          YCC Partner / YCC Co-Partner / Classmate Partner applications
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
        coPartnersByPartnerId={activeId === "campus" ? coPartnersByPartnerId : undefined}
      />
    </div>
  );
}
