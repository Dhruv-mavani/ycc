"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LABEL_BY_STATUS: Record<string, string> = {
  all: "All statuses",
  paid: "Paid only",
  pending: "Pending only",
};

export function CashCollectionStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get("status") ?? "all";

  // Same instant-feedback pattern as GameFilter — local state so the
  // dropdown updates immediately while the data section suspends
  // separately, synced from the URL during render (not an effect) for
  // browser back/forward.
  const [value, setValue] = useState(paramValue);
  const [prevParamValue, setPrevParamValue] = useState(paramValue);
  if (paramValue !== prevParamValue) {
    setPrevParamValue(paramValue);
    setValue(paramValue);
  }

  function handleChange(next: string | null) {
    setValue(next ?? "all");
    const params = new URLSearchParams(searchParams);
    if (!next || next === "all") params.delete("status");
    else params.set("status", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-[160px]">
        <SelectValue placeholder="All statuses">
          {(v: string | null) => LABEL_BY_STATUS[v ?? "all"] ?? "All statuses"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        <SelectItem value="paid">Paid only</SelectItem>
        <SelectItem value="pending">Pending only</SelectItem>
      </SelectContent>
    </Select>
  );
}
