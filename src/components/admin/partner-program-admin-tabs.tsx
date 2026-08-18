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
  age: number | null;
  gender: string | null;
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
  { id: "classmate", label: "Squad" },
] as const;

const HIERARCHY_NOTE: Record<(typeof PARTNER_TYPES)[number]["id"], string> = {
  campus: "YCC Partners are approved by an admin here.",
  class: "YCC Co-Partners are normally approved by the YCC Partner who referred them — you can override that below.",
  classmate: "Squad members are normally approved by the YCC Co-Partner who referred them — you can override that below.",
};

// Groups a partner's directly-recruited children by referred_by_id, so the
// admin can see each YCC Partner's recruited Co-Partners, or each
// Co-Partner's recruited Squad — same shape, one level down each time.
function groupByReferrer(
  applications: PartnerProgramApplication[],
  childType: PartnerType,
) {
  const map = new Map<string, PartnerProgramApplication[]>();
  for (const app of applications) {
    if (app.partner_type !== childType || !app.referred_by_id) continue;
    const list = map.get(app.referred_by_id) ?? [];
    list.push(app);
    map.set(app.referred_by_id, list);
  }
  return map;
}

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

  const coPartnersByPartnerId = useMemo(
    () => groupByReferrer(applications, "class"),
    [applications],
  );
  // Keyed by referred_by_id regardless of whether that referrer is a
  // Co-Partner or a Partner — Squad can attach directly to either, so this
  // one map correctly serves both the "direct Squad" badge on the Partner
  // tab and the "Squad" badge on the Co-Partner tab.
  const squadByReferrerId = useMemo(
    () => groupByReferrer(applications, "classmate"),
    [applications],
  );

  // Campus (Partner) cards show two badges: Co-Partners recruited, and
  // Squad members who joined directly under them (skipping the Co-Partner
  // level). Co-Partner cards show one: their own recruited Squad.
  const childGroups =
    activeId === "campus"
      ? [
          { label: "Co-Partner", map: coPartnersByPartnerId },
          { label: "Squad Member", map: squadByReferrerId },
        ]
      : activeId === "class"
        ? [{ label: "Squad Member", map: squadByReferrerId }]
        : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Partner program applications</h1>
        <p className="text-muted-foreground text-sm">
          YCC Partner / YCC Co-Partner / Squad applications
          submitted through the public form.
        </p>
      </div>

      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-border/50 bg-muted p-1">
        {PARTNER_TYPES.map((type) => (
          <Button
            key={type.id}
            type="button"
            size="sm"
            variant={type.id === activeId ? "default" : "ghost"}
            className={type.id === activeId ? "" : "border border-border/50"}
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
        childGroups={childGroups}
      />
    </div>
  );
}
