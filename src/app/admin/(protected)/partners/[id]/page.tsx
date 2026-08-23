import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, Award } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerChildrenBadge } from "@/components/admin/partner-children-badge";
import { EventFilter } from "@/components/admin/event-filter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PartnerType } from "@/lib/supabase/types";

const CHILD_TYPE: Partial<Record<PartnerType, PartnerType>> = {
  campus: "class",
  class: "classmate",
};

const TYPE_LABEL: Record<PartnerType, string> = {
  campus: "YCC Partner",
  class: "YCC Co-Partner",
  classmate: "Squad",
};

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export default async function AdminPartnerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ event?: string }>;
}) {
  const { id } = await params;
  const { event: eventId } = await searchParams;
  const admin = createAdminClient();

  const { data: partner } = await admin
    .from("partner_program_applications")
    .select(
      "id, name, email, mobile, age, gender, instagram_handle, partner_type, status, team_code, unique_id, dues_paid, referred_by_id, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (!partner) notFound();

  const childType = CHILD_TYPE[partner.partner_type];

  const [{ data: rawChildren }, { data: referrer }, { data: events }] = await Promise.all([
    childType
      ? admin
          .from("partner_program_applications")
          .select("id, name, mobile, status, dues_paid, created_at, partner_type")
          .eq("referred_by_id", partner.id)
          .order("name")
      : Promise.resolve({ data: [] as { id: string; name: string; mobile: string; status: string; dues_paid: boolean; created_at: string; partner_type: PartnerType }[] }),
    partner.referred_by_id
      ? admin
          .from("partner_program_applications")
          .select("id, name")
          .eq("id", partner.referred_by_id)
          .maybeSingle()
      : Promise.resolve({ data: null as { id: string; name: string } | null }),
    admin.from("events").select("id, name").order("created_at"),
  ]);

  // A Partner's direct recruits can be a mix of Co-Partners and Squad who
  // joined them directly (skipping the Co-Partner level) — split by each
  // child's own type rather than assuming they all match childType, or
  // Squad get mislabeled as Co-Partners in the badge/summary below.
  const children = rawChildren ?? [];
  const coPartnerChildren = children.filter((c) => c.partner_type === "class");
  const squadChildren = children.filter((c) => c.partner_type === "classmate");

  // One level further down, just to show each child's own squad progress —
  // e.g. how many Squad members a Co-Partner has recruited so far.
  const childIds = (children ?? []).map((c) => c.id);
  const { data: grandchildren } =
    childIds.length > 0
      ? await admin
          .from("partner_program_applications")
          .select("referred_by_id")
          .in("referred_by_id", childIds)
          .eq("status", "approved")
      : { data: [] as { referred_by_id: string | null }[] };

  const downstreamCountById = new Map<string, number>();
  for (const g of grandchildren ?? []) {
    if (!g.referred_by_id) continue;
    downstreamCountById.set(
      g.referred_by_id,
      (downstreamCountById.get(g.referred_by_id) ?? 0) + 1,
    );
  }

  // Teams this partner has actually registered (and paid for) from their
  // roster — a roster bigger than 6 gets filed as multiple teams, in
  // batches of 6, all under the one college row keyed by their team_code.
  const { data: squadCollege } = partner.team_code
    ? await admin
        .from("colleges")
        .select("id")
        .eq("initials", partner.team_code)
        .maybeSingle()
    : { data: null as { id: string } | null };

  let teamRegistrationsQuery = squadCollege
    ? admin
        .from("registrations")
        .select("id, team_name, status, amount_paise, created_at, event_id")
        .eq("college_id", squadCollege.id)
        .order("created_at")
    : null;
  if (teamRegistrationsQuery && eventId) {
    teamRegistrationsQuery = teamRegistrationsQuery.eq("event_id", eventId);
  }
  const { data: teamRegistrations } = teamRegistrationsQuery
    ? await teamRegistrationsQuery
    : { data: [] as { id: string; team_name: string | null; status: string; amount_paise: number; created_at: string; event_id: string }[] };

  const teamIds = (teamRegistrations ?? []).map((t) => t.id);
  const { data: teamParticipants } =
    teamIds.length > 0
      ? await admin
          .from("participants")
          .select("registration_id, name, is_captain")
          .in("registration_id", teamIds)
          .order("is_captain", { ascending: false })
      : { data: [] as { registration_id: string; name: string; is_captain: boolean }[] };

  // A Partner shows two badges (Co-Partners recruited, and Squad who
  // joined them directly); a Co-Partner shows one (their own Squad); a
  // Squad member shows none — matching the same split used in the
  // Partner Program applications list.
  const childBadgeGroups =
    partner.partner_type === "campus"
      ? [
          { label: "Co-Partner", grandchildLabel: TYPE_LABEL.classmate, items: coPartnerChildren },
          { label: "Squad Member", grandchildLabel: null, items: squadChildren },
        ]
      : partner.partner_type === "class"
        ? [{ label: "Squad Member", grandchildLabel: null, items: squadChildren }]
        : [];

  const recruitSummary = [
    coPartnerChildren.length > 0
      ? `${coPartnerChildren.length} Co-Partner${coPartnerChildren.length === 1 ? "" : "s"}`
      : null,
    squadChildren.length > 0 || coPartnerChildren.length === 0
      ? `${squadChildren.length} Squad member${squadChildren.length === 1 ? "" : "s"}`
      : null,
  ]
    .filter(Boolean)
    .join(" and ");

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={
          <Link href="/admin">
            <ArrowLeftIcon className="size-4" />
            Back to overview
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-2xl break-words">{partner.name}</CardTitle>
              <CardDescription className="break-words">
                {TYPE_LABEL[partner.partner_type]}
                {referrer ? (
                  <>
                    {" "}
                    · referred by{" "}
                    <Link
                      href={`/admin/partners/${referrer.id}`}
                      className="text-primary hover:underline"
                    >
                      {referrer.name}
                    </Link>
                  </>
                ) : null}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {childBadgeGroups.map((group) => (
                <PartnerChildrenBadge
                  key={group.label}
                  partnerName={partner.name}
                  childLabel={group.label}
                  grandchildLabel={group.grandchildLabel}
                  items={group.items.map((c) => ({
                    id: c.id,
                    name: c.name,
                    mobile: c.mobile,
                    status: c.status,
                    createdAt: c.created_at,
                    downstream: downstreamCountById.get(c.id) ?? 0,
                  }))}
                />
              ))}
              {(partner.partner_type === "classmate"
                ? partner.unique_id
                : partner.team_code) ? (
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <a
                      href={`/api/partner-program/certificate/${partner.id}/download?view=true`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Award className="size-3.5" />
                      Certificate
                    </a>
                  }
                />
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Mobile</p>
            <p className="font-medium">{partner.mobile}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Email</p>
            <p className="font-medium truncate">{partner.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Age / Gender</p>
            <p className="font-medium capitalize">
              {partner.age ?? "—"}{partner.gender ? ` · ${partner.gender}` : ""}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Instagram</p>
            <p className="font-medium">@{partner.instagram_handle}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Team code</p>
            <p className="font-medium font-mono">{partner.team_code ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Entry ID</p>
            <p className="font-medium font-mono">{partner.unique_id ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider">Joined</p>
            <p className="font-medium">{formatJoinDate(partner.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      {partner.team_code ? (
        <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
          <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <CardTitle>Teams registered by {partner.name}</CardTitle>
                <CardDescription>
                  {recruitSummary} recruited, filed into{" "}
                  {(teamRegistrations ?? []).length} team
                  {(teamRegistrations ?? []).length === 1 ? "" : "s"} of 6 so far.
                </CardDescription>
              </div>
              <Suspense fallback={<div className="h-9 w-full rounded-lg bg-muted animate-pulse sm:w-[280px]" />}>
                <EventFilter events={events ?? []} />
              </Suspense>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-border/50 p-0">
            {(teamRegistrations ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No teams registered yet.
              </p>
            ) : (
              (teamRegistrations ?? []).map((t, i) => {
                const members = (teamParticipants ?? []).filter(
                  (p) => p.registration_id === t.id,
                );
                return (
                  <div key={t.id} className="px-4 py-3 sm:px-6 space-y-2">
                    <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                      {squadCollege ? (
                        <Link
                          href={`/admin/colleges/${squadCollege.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {i + 1}. {t.team_name ?? `Team ${i + 1}`}
                        </Link>
                      ) : (
                        <span className="font-medium">
                          {i + 1}. {t.team_name ?? `Team ${i + 1}`}
                        </span>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-emerald-600 font-semibold text-sm">
                          {formatRupees(t.amount_paise)}
                        </span>
                        <Badge
                          variant="secondary"
                          className={
                            t.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 capitalize"
                              : t.status === "failed" || t.status === "cancelled"
                                ? "bg-destructive/10 text-destructive border-destructive/20 capitalize"
                                : "capitalize"
                          }
                        >
                          {t.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {members.map((m) => m.name).join(", ")}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
