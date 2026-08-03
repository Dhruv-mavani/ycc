"use client";

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
  const current = searchParams.get("event") ?? "all";

  function handleChange(value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "all") params.delete("event");
    else params.set("event", value);
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-[220px]">
        <SelectValue placeholder="All events">
          {(value: string | null) =>
            events.find((e) => e.id === value)?.name ?? "All events"
          }
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
