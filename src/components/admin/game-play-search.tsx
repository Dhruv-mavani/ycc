"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 350;

export function GamePlaySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get("q") ?? "";

  // Typed value updates instantly; the URL (and the server refetch it
  // triggers) only follows after a short debounce so every keystroke
  // doesn't fire its own request.
  const [value, setValue] = useState(paramValue);
  const [prevParamValue, setPrevParamValue] = useState(paramValue);
  if (paramValue !== prevParamValue) {
    setPrevParamValue(paramValue);
    setValue(paramValue);
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  function handleChange(next: string) {
    setValue(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (next.trim()) params.set("q", next.trim());
      else params.delete("q");
      router.push(`${pathname}?${params.toString()}`);
    }, DEBOUNCE_MS);
  }

  return (
    <div className="relative w-full sm:w-[260px]">
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search player or team..."
        className="h-9 pl-8"
      />
    </div>
  );
}
