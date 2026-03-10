"use client";

import React from "react";
import { getRandomQuote } from "@/lib/data";

export default function QuoteCard() {
  const [quote, setQuote] = React.useState(() => getRandomQuote());

  const refreshQuote = () => {
    setQuote(getRandomQuote());
  };

  return (
    <div className="card animate-slide-up bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-100 dark:border-pink-800/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
            &ldquo;{quote.quote}&rdquo;
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            — {quote.author}
          </p>
        </div>
        <button
          onClick={refreshQuote}
          className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-400 hover:text-pink-500 transition-colors flex-shrink-0 ml-2"
          title="New quote"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
