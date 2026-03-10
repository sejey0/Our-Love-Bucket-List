"use client";

import React from "react";
import { BucketItem } from "@/types/bucket";

interface ProgressBarProps {
  items: BucketItem[];
}

export default function ProgressBar({ items }: ProgressBarProps) {
  const total = items.length;
  const completed = items.filter((i) => i.status === "Completed").length;
  const inProgress = items.filter((i) => i.status === "In Progress").length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">
          Overall Progress
        </h3>
        <span className="text-2xl font-bold text-gradient">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-700 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 5 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {total}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total Dreams
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{inProgress}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            In Progress
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">{completed}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Completed
          </div>
        </div>
      </div>
    </div>
  );
}
