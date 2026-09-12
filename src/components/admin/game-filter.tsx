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
import { GAMES } from "@/lib/games";

export function GameFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get("game") ?? "all";

  // Same instant-feedback pattern as EventFilter/DateRangeFilter — local
  // state so the dropdown updates immediately while the data section
  // suspends separately, synced from the URL during render (not an
  // effect) for browser back/forward.
  const [value, setValue] = useState(paramValue);
  const [prevParamValue, setPrevParamValue] = useState(paramValue);
  if (paramValue !== prevParamValue) {
    setPrevParamValue(paramValue);
    setValue(paramValue);
  }

  function handleChange(next: string | null) {
    setValue(next ?? "all");
    const params = new URLSearchParams(searchParams);
    if (!next || next === "all") params.delete("game");
    else params.set("game", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-[220px]">
        <SelectValue placeholder="All games">
          {(v: string | null) =>
            GAMES.find((g) => g.slug === v)?.title ?? "All games"
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All games</SelectItem>
        {GAMES.map((g) => (
          <SelectItem key={g.slug} value={g.slug}>
            {g.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
