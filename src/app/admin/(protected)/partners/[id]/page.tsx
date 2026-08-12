import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  classmate: "Classmate Partner",
};

export default async function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: partner } = await admin
    .from("partner_program_applications")
    .select(
      "id, name, email, mobile, age, gender, instagram_handle, partner_type, status, team_code, unique_id, dues_paid, referred_by_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!partner) notFound();

  const childType = CHILD_TYPE[partner.partner_type];

  const [{ data: children }, { data: referrer }] = await Promise.all([
    childType
      ? admin
          .from("partner_program_applications")
          .select("id, name, mobile, status, dues_paid")
          .eq("referred_by_id", partner.id)
          .order("name")
      : Promise.resolve({ data: [] as { id: string; name: string; mobile: string; status: string; dues_paid: boolean }[] }),
    partner.referred_by_id
      ? admin
          .from("partner_program_applications")
          .select("id, name")
          .eq("id", partner.referred_by_id)
          .maybeSingle()
      : Promise.resolve({ data: null as { id: string; name: string } | null }),
  ]);

  // One level further down, just to show each child's own squad progress —
  // e.g. how many Classmate Partners a Co-Partner has recruited so far.
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

  const childLabel = childType ? TYPE_LABEL[childType] : null;

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
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{partner.name}</CardTitle>
              <CardDescription>
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
            <Badge
              variant="secondary"
              className={
                partner.status === "approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 capitalize"
                  : partner.status === "rejected"
                    ? "bg-destructive/10 text-destructive border-destructive/20 capitalize"
                    : "capitalize"
              }
            >
              {partner.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
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
        </CardContent>
      </Card>

      {childLabel ? (
        <Card className="overflow-hidden border-border/50 shadow-sm p-0 gap-0">
          <CardHeader className="bg-muted/30 border-b border-border/50 p-4 sm:p-6">
            <CardTitle>{childLabel}s referred by {partner.name}</CardTitle>
            <CardDescription>
              {(children ?? []).length} recruited so far
              {CHILD_TYPE[childType!] ? " — click a name to see their own progress" : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/50 p-0">
            {(children ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No {childLabel}s yet.
              </p>
            ) : (
              (children ?? []).map((c) => {
                const grandchildType = CHILD_TYPE[childType!];
                const downstream = downstreamCountById.get(c.id) ?? 0;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
                  >
                    <div className="min-w-0">
                      {grandchildType ? (
                        <Link
                          href={`/admin/partners/${c.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {c.name}
                        </Link>
                      ) : (
                        <span className="font-medium">{c.name}</span>
                      )}
                      <p className="text-muted-foreground text-xs">{c.mobile}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {grandchildType ? (
                        <Badge variant="outline" className="text-xs">
                          {downstream} {TYPE_LABEL[grandchildType]}
                          {downstream === 1 ? "" : "s"}
                        </Badge>
                      ) : null}
                      <Badge
                        variant="secondary"
                        className={
                          c.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 capitalize"
                            : c.status === "rejected"
                              ? "bg-destructive/10 text-destructive border-destructive/20 capitalize"
                              : "capitalize"
                        }
                      >
                        {c.status}
                      </Badge>
                    </div>
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
