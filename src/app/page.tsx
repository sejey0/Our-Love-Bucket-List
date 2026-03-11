"use client";

import React from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-petal border-t-rose-gold rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#FFF8F0",
            color: "#722F37",
            borderRadius: "9999px",
            padding: "12px 20px",
            boxShadow: "0 4px 16px rgba(183,110,121,0.2)",
            fontSize: "14px",
            fontFamily: "var(--font-quicksand), Quicksand, sans-serif",
            border: "1px solid rgba(183,110,121,0.15)",
          },
        }}
      />
      {isAuthenticated ? (
        <Dashboard onLogout={logout} />
      ) : (
        <LoginForm onLogin={login} />
      )}
    </>
  );
}
