"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RegistrationsByDay } from "@/lib/admin-stats";

function formatDayLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

export function RegistrationsTrendChart({ data }: { data: RegistrationsByDay[] }) {
  const hasAny = data.some((d) => d.registrations > 0);

  if (!hasAny) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No confirmed registrations in this window yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="registrationsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDayLabel}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          labelFormatter={(label) => formatDayLabel(String(label))}
          formatter={(value) => [value, "Registrations"]}
          contentStyle={{
            backgroundColor: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          itemStyle={{ color: "var(--foreground)", fontWeight: 500 }}
        />
        <Area
          type="monotone"
          dataKey="registrations"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#registrationsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
