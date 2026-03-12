"use client";

import React from "react";

export type Section = "bucket" | "checklist" | null;

interface HeaderProps {
  onLogout: () => void;
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export default function Header({
  onLogout,
  activeSection,
  onSectionChange,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b border-rose/20"
      style={{ backgroundColor: "#b76e79" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">
            {activeSection === "bucket"
              ? "Our Love Bucket List"
              : activeSection === "checklist"
                ? "Our Checklist"
                : "Us"}
          </h1>

          {/* Back to Menu - only show when a section is active */}
          {activeSection && (
            <button
              onClick={() => onSectionChange(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 rounded-pill transition-colors duration-150 border border-white/20"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Menu
            </button>
          )}
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-pill bg-white/60 backdrop-blur-sm border border-rose/20 hover:bg-blush text-rose-gold hover:text-wine transition-all duration-300 text-sm font-semibold"
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
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
