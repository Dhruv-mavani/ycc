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

const LABEL_BY_RESULT: Record<string, string> = {
  all: "Won & lost",
  won: "Won only",
  lost: "Lost only",
};

export function GameResultFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get("result") ?? "all";

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
    if (!next || next === "all") params.delete("result");
    else params.set("result", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-[150px]">
        <SelectValue placeholder="Won & lost">
          {(v: string | null) => LABEL_BY_RESULT[v ?? "all"] ?? "Won & lost"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Won & lost</SelectItem>
        <SelectItem value="won">Won only</SelectItem>
        <SelectItem value="lost">Lost only</SelectItem>
      </SelectContent>
    </Select>
  );
}
