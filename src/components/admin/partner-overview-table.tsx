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
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PartnerSquadReadiness, CollegeCampusPartnerOverviewRow } from "@/lib/admin-stats";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

type ActiveType = "campus" | "class" | "college-campus-partner";

const TYPE_LABEL: Record<ActiveType, string> = {
  campus: "YCC Partner",
  class: "YCC Co-Partner",
  "college-campus-partner": "YCC College Campus Partner",
};

const UNASSIGNED_COLLEGE = "__unassigned__";

interface CollegeOption {
  id: string;
  name: string;
  initials: string;
}

export function PartnerOverviewTable({
  data,
  collegeCampusPartnerData,
  colleges,
}: {
  data: PartnerSquadReadiness[];
  collegeCampusPartnerData: CollegeCampusPartnerOverviewRow[];
  colleges: CollegeOption[];
}) {
  const [activeType, setActiveType] = useState<ActiveType>("campus");
  const [collegeFilter, setCollegeFilter] = useState<string>("all");

  const isCollegeCampusPartner = activeType === "college-campus-partner";

  const hasUnassigned = isCollegeCampusPartner
    ? collegeCampusPartnerData.some((p) => !p.collegeName)
    : data.some((p) => !p.collegeName);

  const filteredPartners = data.filter((p) => {
    if (p.partnerType !== activeType) return false;
    if (collegeFilter === "all") return true;
    if (collegeFilter === UNASSIGNED_COLLEGE) return !p.collegeName;
    return p.collegeName === collegeFilter;
  });

  const filteredCollegeCampusPartners = collegeCampusPartnerData.filter((p) => {
    if (collegeFilter === "all") return true;
    if (collegeFilter === UNASSIGNED_COLLEGE) return !p.collegeName;
    return p.collegeName === collegeFilter;
  });

  const filteredCount = isCollegeCampusPartner
    ? filteredCollegeCampusPartners.length
    : filteredPartners.length;

  return (
    <div className="min-w-0">
      <div className="p-4 sm:p-6 border-b border-border/50 bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex flex-col min-[480px]:flex-row gap-2 w-full sm:w-auto">
          <Select value={activeType} onValueChange={(v) => setActiveType(v as ActiveType)}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="YCC Partner">
                {(v: string | null) => TYPE_LABEL[(v as ActiveType) ?? "campus"]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="campus">YCC Partner</SelectItem>
              <SelectItem value="class">YCC Co-Partner</SelectItem>
              <SelectItem value="college-campus-partner">YCC College Campus Partner</SelectItem>
            </SelectContent>
          </Select>
          <SearchableSelect
            value={collegeFilter}
            onChange={(v) => setCollegeFilter(v ?? "all")}
            placeholder="Filter by college"
            className="w-full sm:w-[220px]"
            options={[
              { value: "all", label: "All colleges" },
              ...(hasUnassigned ? [{ value: UNASSIGNED_COLLEGE, label: "No college set" }] : []),
              ...colleges.map((c) => ({ value: c.name, label: `${c.initials}\u00A0\u00A0•\u00A0\u00A0${c.name}` })),
            ]}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Total {TYPE_LABEL[activeType]}s: <span className="font-semibold text-foreground">{filteredCount}</span>
        </p>
      </div>
      <div className="overflow-x-auto">
        {isCollegeCampusPartner ? (
          <Table className="min-w-[560px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80 pl-6">Name</TableHead>
                <TableHead className="font-semibold text-foreground/80">College</TableHead>
                <TableHead className="font-semibold text-foreground/80">Stream</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80">Year / Sem</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80 pr-6">Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollegeCampusPartners.map((p) => (
                <TableRow key={p.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="pl-6 font-medium">
                    <Link
                      href={`/admin/partner-program?type=college-campus-partner&highlight=${p.id}`}
                      className="text-primary hover:underline"
                    >
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>{p.collegeName ?? "—"}</TableCell>
                  <TableCell>{p.stream}</TableCell>
                  <TableCell className="text-right">{p.year} / {p.semester}</TableCell>
                  <TableCell className="text-right pr-6 font-mono text-xs">{p.code ?? "—"}</TableCell>
                </TableRow>
              ))}
              {filteredCollegeCampusPartners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center py-12">
                    No {TYPE_LABEL[activeType]}s yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        ) : (
          <Table className="min-w-[560px]">
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground/80 pl-6">Name</TableHead>
                {activeType === "campus" ? (
                  <TableHead className="text-right font-semibold text-foreground/80">Co-Partners</TableHead>
                ) : null}
                <TableHead className="text-right font-semibold text-foreground/80">
                  {activeType === "campus" ? "Squad (direct)" : "Squad"}
                </TableHead>
                <TableHead className="text-right font-semibold text-foreground/80">Teams</TableHead>
                <TableHead className="text-right font-semibold text-foreground/80 pr-6">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((p) => (
                <TableRow key={p.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="pl-6 font-medium">
                    <Link href={`/admin/partners/${p.id}`} className="text-primary hover:underline">
                      {p.name}
                    </Link>
                  </TableCell>
                  {activeType === "campus" ? (
                    <TableCell className="text-right">{p.coPartners}</TableCell>
                  ) : null}
                  <TableCell className="text-right">{p.directSquad}</TableCell>
                  <TableCell className="text-right">{p.teamsRegistered}</TableCell>
                  <TableCell className="text-right pr-6 font-semibold text-emerald-600">
                    {formatRupees(p.revenuePaise)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredPartners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={activeType === "campus" ? 5 : 4}
                    className="text-muted-foreground text-center py-12"
                  >
                    No approved {TYPE_LABEL[activeType]}s yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
