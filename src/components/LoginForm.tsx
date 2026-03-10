"use client";

import React, { useState } from "react";
import { getRandomQuote } from "@/lib/data";

interface LoginFormProps {
  onLogin: (answer: string) => boolean;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const quote = React.useMemo(() => getRandomQuote(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError("Please enter your answer");
      return;
    }
    const success = onLogin(answer);
    if (!success) {
      setError("That's not quite right. Try again! 💭");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div
          className={`card animate-fade-in ${isShaking ? "animate-bounce-soft" : ""}`}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-xl shadow-pink-500/25 mb-4">
              <span className="text-4xl">💝</span>
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Our Bucket List
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Answer the question to unlock our adventures
            </p>
          </div>

          {/* Security Question */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                🔐 What is our monthsary?
              </label>
              <input
                type="text"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setError("");
                }}
                placeholder="Enter the date..."
                className="input-field text-lg"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400 animate-slide-down">
                  {error}
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full text-lg py-3">
              Unlock Our List ✨
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
            Hint: Month Day Year (e.g., January 1 2025)
          </p>
        </div>

        {/* Quote */}
        <div className="mt-6 text-center animate-fade-in">
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            &ldquo;{quote.quote}&rdquo;
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            — {quote.author}
          </p>
        </div>
      </div>
    </div>
  );
}
