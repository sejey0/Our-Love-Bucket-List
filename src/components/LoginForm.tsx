"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getRandomQuote } from "@/lib/data";

interface LoginFormProps {
  onLogin: (answer: Date) => boolean;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const quote = React.useMemo(() => getRandomQuote(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setError("Please select a date");
      return;
    }
    const success = onLogin(selectedDate);
    if (!success) {
      setError("That's not quite right. Try again!");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Floating hearts background */}
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>

      <div className="w-full max-w-md relative z-10">
        <div
          className={`card animate-fade-in ${isShaking ? "animate-bounce-soft" : ""}`}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-romantic flex items-center justify-center shadow-rose-lg mb-4">
              <span className="text-4xl">💝</span>
            </div>
            <h1 className="heading-cursive text-5xl text-gradient mb-2">
              Our Bucket List
            </h1>
            <p className="text-rose-gold/60 text-sm">
              Answer the question to unlock our adventures
            </p>
          </div>

          {/* Security Question */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-wine mb-2">
                What is our monthsary?
              </label>
              <div className="flex justify-center">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => {
                    setSelectedDate(date);
                    setError("");
                  }}
                  inline
                  dateFormat="MMMM d, yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={15}
                />
              </div>
              {selectedDate && (
                <p className="mt-2 text-center text-sm text-rose-gold font-semibold">
                  Selected: {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
              {error && (
                <p className="mt-2 text-sm text-wine animate-slide-down text-center">
                  {error}
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full text-lg py-3">
              Unlock Our List
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-xs text-rose/80 mt-4">
            Hint: Select our special date on the calendar
          </p>
        </div>

        {/* Quote */}
        <div className="mt-6 text-center animate-fade-in">
          <p className="text-sm text-rose-gold/70 italic">
            &ldquo;{quote.quote}&rdquo;
          </p>
          <p className="text-xs text-rose/60 mt-1">— {quote.author}</p>
        </div>
      </div>
    </div>
  );
}
