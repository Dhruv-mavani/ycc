"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Archive } from "lucide-react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { Switch } from "@/components/ui/switch";

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

  // Pinned above the option list inside the dropdown panel itself (right
  // alongside "All events"), rather than a separate button beside the
  // trigger — a small toggle switch, not a full control, since this is a
  // secondary view switch rather than its own field.
  const header =
    archivedEvents.length > 0 ? (
      <div className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Archive className="h-3.5 w-3.5" />
          Archived ({archivedEvents.length})
        </span>
        <Switch
          size="sm"
          checked={showArchived}
          onCheckedChange={(checked) => setShowArchived(Boolean(checked))}
        />
      </div>
    ) : undefined;

  return (
    <SearchableSelect
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Filter by event"
      className="h-9 w-full sm:w-[280px]"
      truncateLabels={false}
      header={header}
    />
  );
}
