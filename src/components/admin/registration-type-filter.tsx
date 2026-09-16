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

const LABEL_BY_TYPE: Record<string, string> = {
  school: "Super Champs (School)",
  individual: "Jackpot Heist (Individual)",
};

export function RegistrationTypeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get("type") ?? "school";

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
    const nextValue = next ?? "school";
    setValue(nextValue);
    const params = new URLSearchParams(searchParams);
    if (nextValue === "school") params.delete("type");
    else params.set("type", nextValue);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-[220px]">
        <SelectValue placeholder="Super Champs (School)">
          {(v: string | null) => LABEL_BY_TYPE[v ?? "school"] ?? "Super Champs (School)"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="school">Super Champs (School)</SelectItem>
        <SelectItem value="individual">Jackpot Heist (Individual)</SelectItem>
      </SelectContent>
    </Select>
  );
}
