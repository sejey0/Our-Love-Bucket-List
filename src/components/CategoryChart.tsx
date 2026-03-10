"use client";

import React from "react";
import { BucketItem, CATEGORY_EMOJIS } from "@/types/bucket";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface CategoryChartProps {
  items: BucketItem[];
}

const CHART_COLORS = [
  "#3b82f6",
  "#f97316",
  "#a855f7",
  "#22c55e",
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#eab308",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#6b7280",
];

export default function CategoryChart({ items }: CategoryChartProps) {
  const categoryData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: `${CATEGORY_EMOJIS[name] || "📌"} ${name}`,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="card animate-slide-up">
      <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
        Categories Overview
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {categoryData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
