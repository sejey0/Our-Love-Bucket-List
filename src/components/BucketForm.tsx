"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BucketItem, CATEGORIES, PRIORITIES, STATUSES } from "@/types/bucket";
import { getRandomBucketIdea } from "@/lib/data";
import toast from "react-hot-toast";

interface BucketFormProps {
  onSubmit: (item: Partial<BucketItem>) => Promise<void>;
  editItem?: BucketItem | null;
  onCancel?: () => void;
}

export default function BucketForm({
  onSubmit,
  editItem,
  onCancel,
}: BucketFormProps) {
  const [title, setTitle] = useState(editItem?.title || "");
  const [description, setDescription] = useState(editItem?.description || "");
  const [category, setCategory] = useState<string>(
    editItem?.category || "Personal",
  );
  const [priority, setPriority] = useState<string>(
    editItem?.priority || "Medium",
  );
  const [status, setStatus] = useState<string>(
    editItem?.status || "Not Started",
  );
  const [targetDate, setTargetDate] = useState<Date | null>(
    editItem?.target_date ? new Date(editItem.target_date) : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!!editItem);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority: priority as BucketItem["priority"],
        status: status as BucketItem["status"],
        target_date: targetDate ? targetDate.toISOString().split("T")[0] : null,
      });
      if (!editItem) {
        setTitle("");
        setDescription("");
        setCategory("Personal");
        setPriority("Medium");
        setStatus("Not Started");
        setTargetDate(null);
        setIsExpanded(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRandomIdea = () => {
    const idea = getRandomBucketIdea();
    setTitle(idea.title);
    setDescription(idea.description);
    setCategory(idea.category);
    setIsExpanded(true);
    toast("Here's an idea for you!", { icon: "🎲" });
  };

  return (
    <div className="card animate-slide-up">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                editItem ? "Edit title..." : "Add a new dream to our list..."
              }
              className="input-field text-lg font-medium"
              onFocus={() => setIsExpanded(true)}
            />
          </div>
          {!editItem && (
            <button
              type="button"
              onClick={handleRandomIdea}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
              title="Get a random bucket list idea"
            >
              <span>🎲</span>
              <span className="hidden sm:inline">Random Idea</span>
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4 animate-slide-down">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)..."
              className="input-field resize-none"
              rows={2}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-rose-gold/70 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field text-sm py-2"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-rose-gold/70 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input-field text-sm py-2"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-rose-gold/70 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field text-sm py-2"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-gold/70 mb-1">
                Target Date
                {targetDate && (
                  <span className="ml-2 text-rose-gold font-normal">
                    —{" "}
                    {targetDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    <button
                      type="button"
                      onClick={() => setTargetDate(null)}
                      className="ml-1 text-rose-gold/50 hover:text-rose-gold"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </label>
              <DatePicker
                selected={targetDate}
                onChange={(date: Date | null) => setTargetDate(date)}
                inline
                dateFormat="MMM d, yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={15}
              />
            </div>

            <div className="flex gap-2 justify-end">
              {isExpanded && !editItem && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Cancel
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-sm px-6 py-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : editItem ? (
                  "Update"
                ) : (
                  "Add to List"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
