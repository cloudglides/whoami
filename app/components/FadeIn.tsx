"use client";

import { useEffect, useState } from "react";

export default function FadeIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);
  return (
    <div className={`${mounted ? "fade-in" : "opacity-0"} ${className}`}>
      {children}
    </div>
  );
}
