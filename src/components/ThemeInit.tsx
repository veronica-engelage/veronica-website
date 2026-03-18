"use client";

import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let cookieTheme: string | null = null;
    let stored: string | null = null;

    try {
      const cookieMatch = document.cookie.match(/(?:^|; )theme=([^;]+)/);
      cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
    } catch (e) {}

    try {
      stored = localStorage.getItem("theme");
    } catch (e) {}

    const resolved = stored || cookieTheme;
    const useDark = resolved ? resolved === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", useDark);
    document.documentElement.classList.toggle("light", resolved === "light");

    try {
      if (resolved === "dark" || resolved === "light") {
        document.cookie = "theme=" + resolved + "; path=/; max-age=31536000";
      }
    } catch (e) {}
  }, []);

  return null;
}
