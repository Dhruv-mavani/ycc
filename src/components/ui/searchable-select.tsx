"use client"

import * as React from "react"
import { Combobox } from "@base-ui/react/combobox"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SearchableSelectOption {
  value: string
  label: string
  sublabel?: string
  /** Extra text (e.g. a code) that should also be matched while searching. */
  searchText?: string
}

/**
 * A dropdown that opens on click, focus, or typing, and filters its options
 * live as you type — for fields backed by lists too long to scan by eye
 * (colleges, partner referrers). Built on Base UI's Combobox, which already
 * portals its popup to <body>, so it works correctly inside overflow-hidden
 * containers like Card (unlike a hand-rolled absolutely-positioned dropdown).
 */
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  emptyText = "No results found.",
  className,
}: {
  options: SearchableSelectOption[]
  value: string | null | undefined
  onChange: (value: string | null) => void
  placeholder?: string
  emptyText?: string
  className?: string
}) {
  const selected = options.find((o) => o.value === (value ?? null)) ?? null

  return (
    <Combobox.Root
      items={options}
      value={selected}
      onValueChange={(item) =>
        onChange((item as SearchableSelectOption | null)?.value ?? null)
      }
      isItemEqualToValue={(item: SearchableSelectOption, val: SearchableSelectOption) =>
        item.value === val.value
      }
      itemToStringLabel={(item: SearchableSelectOption) => item.label}
      filter={(item: SearchableSelectOption, query) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          item.label.toLowerCase().includes(q) ||
          (item.searchText ?? "").toLowerCase().includes(q) ||
          (item.sublabel ?? "").toLowerCase().includes(q)
        );
      }}
    >
      <Combobox.InputGroup
        className={cn(
          "border-input flex h-8 w-full items-center gap-1.5 rounded-lg border bg-transparent pl-2.5 pr-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          className,
        )}
      >
        <SearchIcon className="text-muted-foreground size-4 shrink-0" />
        <Combobox.Input
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
        />
        <Combobox.Clear className="text-muted-foreground hover:text-foreground shrink-0">
          <XIcon className="size-3.5" />
        </Combobox.Clear>
        <Combobox.Icon className="shrink-0">
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
        </Combobox.Icon>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner className="isolate z-50" sideOffset={4}>
          <Combobox.Popup className="max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Combobox.Empty className="text-muted-foreground px-3 py-4 text-center text-sm">
              {emptyText}
            </Combobox.Empty>
            <Combobox.List className="p-1">
              {(item: SearchableSelectOption) => (
                <Combobox.Item
                  key={item.value}
                  value={item}
                  className="relative flex w-full cursor-default flex-col min-[380px]:flex-row items-start min-[380px]:items-center justify-between gap-0.5 min-[380px]:gap-2 rounded-md py-1.5 pr-2 pl-6 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <Combobox.ItemIndicator className="absolute left-1.5 flex size-4 items-center justify-center">
                    <CheckIcon className="size-3.5" />
                  </Combobox.ItemIndicator>
                  <span className="min-[380px]:truncate">{item.label}</span>
                  {item.sublabel ? (
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {item.sublabel}
                    </span>
                  ) : null}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

export { SearchableSelect }
