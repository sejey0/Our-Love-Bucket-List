"use client";

import React, { useState, useEffect } from "react";
import {
  BucketItem,
  CATEGORY_COLORS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  CATEGORY_EMOJIS,
} from "@/types/bucket";

export default function SharePage() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/buckets")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const completed = items.filter((i) => i.status === "Completed").length;
  const percentage =
    items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-petal border-t-rose-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 relative">
      {/* Floating hearts */}
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-romantic flex items-center justify-center shadow-rose-lg mb-4">
            <span className="text-3xl">💝</span>
          </div>
          <h1 className="heading-cursive text-5xl text-gradient mb-2">
            Our Love Bucket List
          </h1>
          <p className="text-rose-gold/60">
            {items.length} dreams | {completed} completed | {percentage}% done
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-petal rounded-pill h-3 mb-8 overflow-hidden">
          <div
            className="h-full rounded-pill bg-gradient-romantic transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Items list */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`card animate-slide-up ${item.status === "Completed" ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.status === "Completed"
                      ? "bg-gradient-romantic border-rose-gold text-white"
                      : "border-rose/40"
                  }`}
                >
                  {item.status === "Completed" && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      item.status === "Completed"
                        ? "line-through text-rose-gold/50"
                        : "text-wine"
                    }`}
                  >
                    {CATEGORY_EMOJIS[item.category] || "📌"} {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-rose-gold/60 mt-1">
                      {item.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span
                      className={`badge ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other}`}
                    >
                      {item.category}
                    </span>
                    <span className={`badge ${PRIORITY_COLORS[item.priority]}`}>
                      {item.priority}
                    </span>
                    <span className={`badge ${STATUS_COLORS[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="heading-cursive text-lg text-rose-gold/50">
            Made with love for our adventures together
          </p>
          <a
            href="/"
            className="text-rose-gold hover:text-wine mt-2 inline-block text-sm transition-colors duration-300"
          >
            Go to full app
          </a>
        </div>
      </div>
    </div>
  );
}
