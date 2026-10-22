"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Archive } from "lucide-react";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { Switch } from "@/components/ui/switch";
import { GAME_SLUG_LABELS } from "@/lib/games";

// Mystery Box and Quiz Champion are plain game-mechanic options, always
// shown. Level Up isn't — it's not one option but one per *event* that
// plays it (ycc-go-goa-gone, kismat-ke-khiladi, and whatever plays it
// next), since those are different events that happen to share the same
// mechanic (see getGameInsights/getLevelUpEventOptions in admin-stats.ts).
// Same "Archived" toggle pattern as EventFilter, for the same reason: an
// inactive/retired event (e.g. ycc-go-goa-gone) shouldn't permanently
// clutter the default list.
const NON_LEVEL_UP_GAMES = GAME_SLUG_LABELS.filter((g) => g.slug !== "level-up");

export function GameFilter({
  levelUpEvents,
}: {
  levelUpEvents: { slug: string; name: string; isActive: boolean }[];
}) {
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

  const archivedEvents = levelUpEvents.filter((e) => !e.isActive);
  const activeEvents = levelUpEvents.filter((e) => e.isActive);

  const [showArchived, setShowArchived] = useState(
    archivedEvents.some((e) => `level-up:${e.slug}` === paramValue),
  );

  function handleChange(next: string | null) {
    setValue(next ?? "all");
    const params = new URLSearchParams(searchParams);
    if (!next || next === "all") params.delete("game");
    else params.set("game", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  const visibleEvents = showArchived ? archivedEvents : activeEvents;
  const options: SearchableSelectOption[] = [
    { value: "all", label: "All games" },
    ...NON_LEVEL_UP_GAMES.map((g) => ({ value: g.slug, label: g.title })),
    ...visibleEvents.map((e) => ({ value: `level-up:${e.slug}`, label: e.name })),
  ];

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
      placeholder="All games"
      className="h-9 w-full sm:w-[260px]"
      truncateLabels={false}
      header={header}
    />
  );
}
