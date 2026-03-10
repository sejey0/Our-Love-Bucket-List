"use client";

import React from "react";
import Header from "./Header";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen relative">
      {/* Floating Hearts Background */}
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>
      <div className="floating-heart">&#x2665;</div>

      <Header onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
      </main>
    </div>
  );
}
