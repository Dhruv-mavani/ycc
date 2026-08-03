"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EventFilter({
  events,
}: {
  events: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get("event") ?? "all";

  // Local state so the dropdown reflects the pick instantly — the
  // underlying data section suspends and shows a loader separately, but
  // the control itself shouldn't wait on that round-trip. Synced from the
  // URL during render (not an effect) when it changes via another path,
  // e.g. browser back/forward.
  const [value, setValue] = useState(paramValue);
  const [prevParamValue, setPrevParamValue] = useState(paramValue);
  if (paramValue !== prevParamValue) {
    setPrevParamValue(paramValue);
    setValue(paramValue);
  }

  function handleChange(next: string | null) {
    setValue(next ?? "all");
    const params = new URLSearchParams(searchParams);
    if (!next || next === "all") params.delete("event");
    else params.set("event", next);
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-[220px]">
        <SelectValue placeholder="All events">
          {(v: string | null) => events.find((e) => e.id === v)?.name ?? "All events"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All events</SelectItem>
        {events.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
