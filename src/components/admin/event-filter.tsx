"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";

// A searchable combobox rather than a plain dropdown — as more events pile
// up over seasons (10s now, potentially 100s eventually), a flat <Select>
// stops being scannable, but this stays usable since it filters by typing
// instead of requiring a scroll-and-scan.
export function EventFilter({
  events,
}: {
  events: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
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
    router.push(`${pathname}?${params.toString()}`);
  }

  const options: SearchableSelectOption[] = [
    { value: "all", label: "All events" },
    ...events.map((e) => ({ value: e.id, label: e.name })),
  ];

  return (
    <SearchableSelect
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Filter by event"
      className="h-9 w-full sm:w-[280px]"
      truncateLabels={false}
    />
  );
}
