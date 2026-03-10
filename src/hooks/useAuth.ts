"use client";

import { useState, useEffect, useCallback } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("bucket-list-auth");
    setIsAuthenticated(stored === "true");
    setIsLoading(false);
  }, []);

  const login = useCallback((answer: Date): boolean => {
    const correct = new Date(2025, 6, 15); // July 15, 2025 (month is 0-indexed)
    if (
      answer.getFullYear() === correct.getFullYear() &&
      answer.getMonth() === correct.getMonth() &&
      answer.getDate() === correct.getDate()
    ) {
      localStorage.setItem("bucket-list-auth", "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("bucket-list-auth");
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, isLoading, login, logout };
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bucket-list-dark-mode");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldBeDark = stored ? stored === "true" : prefersDark;
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("bucket-list-dark-mode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  return { isDark, toggleDark };
}
