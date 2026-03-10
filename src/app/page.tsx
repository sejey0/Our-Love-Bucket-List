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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-xl shadow-pink-500/25 mb-4 animate-pulse-slow">
            <span className="text-3xl">💝</span>
          </div>
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto" />
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
            background: "#fff",
            color: "#1e293b",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            fontSize: "14px",
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
