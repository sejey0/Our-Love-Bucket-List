"use client";

import React from "react";
import { CATEGORIES, STATUSES, PRIORITIES } from "@/types/bucket";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
}

export default function FilterBar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: FilterBarProps) {
  return (
    <div className="card animate-slide-up">
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bucket items..."
            className="input-field pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="All">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="sort_order">Custom Order</option>
            <option value="created_at">Date Created</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="target_date">Target Date</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  );
}
