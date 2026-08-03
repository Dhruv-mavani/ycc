"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#64748b'  // slate
];

export function CollegeRevenueChart({
  data,
}: {
  data: { collegeName: string; revenuePaise: number }[];
}) {
  const chartData = data.slice(0, 10).map((d) => ({
    name: d.collegeName,
    revenue: Math.round(d.revenuePaise / 100),
  }));

  if (chartData.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No confirmed registrations yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart margin={{ top: 10, bottom: 10 }}>
        <Pie
          data={chartData}
          dataKey="revenue"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={60}
          paddingAngle={2}
          minAngle={15}
          stroke="var(--background)"
          strokeWidth={2}
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [
            `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
            "Revenue",
          ]}
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
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center" 
          wrapperStyle={{ fontSize: 12, paddingTop: 20 }} 
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
