"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PartnerSquadReadiness } from "@/lib/admin-stats";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

const TYPE_LABEL: Record<"campus" | "class", string> = {
  campus: "YCC Partner",
  class: "YCC Co-Partner",
};

export function PartnerOverviewTable({ data }: { data: PartnerSquadReadiness[] }) {
  const [activeType, setActiveType] = useState<"campus" | "class">("campus");
  const filtered = data.filter((p) => p.partnerType === activeType);

  return (
    <div>
      <div className="p-4 sm:p-6 border-b border-border/50 bg-muted/30">
        <Select value={activeType} onValueChange={(v) => setActiveType(v as "campus" | "class")}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="YCC Partner">
              {(v: string | null) => TYPE_LABEL[(v as "campus" | "class") ?? "campus"]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="campus">YCC Partner</SelectItem>
            <SelectItem value="class">YCC Co-Partner</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[560px]">
          <TableHeader className="bg-muted/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-foreground/80 pl-6">Name</TableHead>
              <TableHead className="text-right font-semibold text-foreground/80">Total participants</TableHead>
              <TableHead className="text-right font-semibold text-foreground/80">Teams</TableHead>
              <TableHead className="text-right font-semibold text-foreground/80 pr-6">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="hover:bg-primary/5 transition-colors">
                <TableCell className="pl-6 font-medium">
                  <Link href={`/admin/partners/${p.id}`} className="text-primary hover:underline">
                    {p.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{p.totalParticipants}</TableCell>
                <TableCell className="text-right">{p.teamsRegistered}</TableCell>
                <TableCell className="text-right pr-6 font-semibold text-emerald-600">
                  {formatRupees(p.revenuePaise)}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-center py-12">
                  No approved {TYPE_LABEL[activeType]}s yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
