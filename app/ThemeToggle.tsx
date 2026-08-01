"use client";

import { useEffect, useRef } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const btn = ref.current;
    if (!btn) return;
    const light = document.documentElement.classList.contains("light");
    btn.textContent = light ? "dark" : "light";
    btn.setAttribute(
      "aria-label",
      light ? "Switch to dark mode" : "Switch to light mode"
    );
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const light = root.classList.toggle("light");
    localStorage.setItem("whoami-theme", light ? "light" : "dark");
    const btn = ref.current;
    if (btn) {
      btn.textContent = light ? "dark" : "light";
      btn.setAttribute(
        "aria-label",
        light ? "Switch to dark mode" : "Switch to light mode"
      );
    }
  };

  return (
    <button
      ref={ref}
      onClick={toggle}
      aria-label="Switch to light mode"
      className={`font-mono text-xs font-bold uppercase tracking-widest ${className}`}
    >
      light
    </button>
  );
}
