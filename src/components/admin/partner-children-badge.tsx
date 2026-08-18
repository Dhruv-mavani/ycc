"use client";

import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChildEntry {
  id: string;
  name: string;
  mobile: string;
  status: string;
  createdAt: string;
  downstream: number;
}

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

// Same "click the count badge to see the full list in a dialog" pattern as
// the Partner Program applications list — keeps this page focused on Teams,
// with the referred-partner roster available on demand instead of always
// taking up space inline.
export function PartnerChildrenBadge({
  partnerName,
  childLabel,
  grandchildLabel,
  items,
}: {
  partnerName: string;
  childLabel: string;
  grandchildLabel: string | null;
  items: ChildEntry[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Badge
        variant="outline"
        className="cursor-pointer bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
        onClick={() => setOpen(true)}
      >
        <Users className="size-3 mr-1" />
        {items.length} {childLabel}
        {items.length === 1 ? "" : "s"}
      </Badge>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {partnerName}&apos;s {childLabel}s
            </DialogTitle>
            <DialogDescription>
              {items.length} {childLabel}
              {items.length === 1 ? "" : "s"} recruited so far.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {[...items]
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
              .map((c) => (
              <div
                key={c.id}
                className="flex flex-col items-start gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 w-full sm:w-auto">
                  <Link
                    href={`/admin/partners/${c.id}`}
                    className="font-medium text-sm text-primary hover:underline truncate block"
                  >
                    {c.name}
                  </Link>
                  <p className="text-muted-foreground text-xs truncate">
                    {c.mobile} · Joined {formatJoinDate(c.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {grandchildLabel ? (
                    <Badge variant="outline" className="text-xs">
                      {c.downstream} {grandchildLabel}
                      {c.downstream === 1 ? "" : "s"}
                    </Badge>
                  ) : null}
                </div>
              </div>
            ))}
            {items.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No {childLabel}s yet.
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
