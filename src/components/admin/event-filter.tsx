"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Archive } from "lucide-react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

// A searchable combobox rather than a plain dropdown — as more events pile
// up over seasons (10s now, potentially 100s eventually), a flat <Select>
// stops being scannable, but this stays usable since it filters by typing
// instead of requiring a scroll-and-scan.
//
// Inactive (is_active=false, e.g. hidden-from-public old events like
// ycc-go-goa-gone) are kept out of the default list — otherwise every
// retired event piles up here forever — behind a small "Archived" toggle
// pill instead. SearchableSelect itself has no grouping/section-header
// concept, so rather than add one there (which would ripple into every
// other place that uses it), the two lists are just swapped out locally.
export function EventFilter({
  events,
}: {
  events: { id: string; name: string; is_active: boolean }[];
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

  const archivedEvents = events.filter((e) => !e.is_active);
  const activeEvents = events.filter((e) => e.is_active);

  // Picking an archived event (e.g. via a direct link with ?event=<id>)
  // should land on the archived view, not silently show "All events" with
  // no indication why the dropdown looks empty of it.
  const [showArchived, setShowArchived] = useState(
    archivedEvents.some((e) => e.id === paramValue),
  );

  function handleChange(next: string | null) {
    setValue(next ?? "all");
    const params = new URLSearchParams(searchParams);
    if (!next || next === "all") params.delete("event");
    else params.set("event", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  const visibleEvents = showArchived ? archivedEvents : activeEvents;
  const options: SearchableSelectOption[] = [
    { value: "all", label: "All events" },
    ...visibleEvents.map((e) => ({ value: e.id, label: e.name })),
  ];

  return (
    <div className="flex items-center gap-2">
      <SearchableSelect
        options={options}
        value={value}
        onChange={handleChange}
        placeholder="Filter by event"
        className="h-9 w-full sm:w-[280px]"
        truncateLabels={false}
      />
      {archivedEvents.length > 0 && (
        <button
          type="button"
          onClick={() => setShowArchived((s) => !s)}
          className={cn(
            "flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors",
            showArchived
              ? "border-primary bg-primary/10 text-primary"
              : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title={
            showArchived
              ? "Showing archived events — click to show active events"
              : "Show archived (hidden-from-public) events"
          }
        >
          <Archive className="h-4 w-4" />
          {showArchived ? "Archived" : `Archive (${archivedEvents.length})`}
        </button>
      )}
    </div>
  );
}
