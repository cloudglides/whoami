"use client";

import { useEffect, useRef, useState } from "react";

const NOISE = "%^&@#$*!?<>[]{}~+=|/\\:;,'-0123456789";

const rand = () => NOISE[Math.floor(Math.random() * NOISE.length)];

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

function garble(text: string) {
  let out = "";
  for (const ch of text) {
    out += /\s/.test(ch) ? ch : rand();
  }
  return out;
}

export default function Scramble({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [revealed, setRevealed] = useState<number | null>(null);
  const countRef = useRef<number | null>(null);
  const animRef = useRef<{ raf: number } | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const hover = window.matchMedia("(hover: hover)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine && hover && !reduce) {
      const raf = requestAnimationFrame(() => {
        countRef.current = 0;
        setRevealed(0);
      });
      return () => cancelAnimationFrame(raf);
    }
    return () => {};
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current.raf);
    };
  }, []);

  const startAnim = (to: number, duration: number) => {
    if (revealed === null || revealed >= text.length) return;
    if (animRef.current) cancelAnimationFrame(animRef.current.raf);
    const from = countRef.current ?? revealed;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const value = Math.round(from + (to - from) * easeOut(p));
      setRevealed(value);
      countRef.current = value;
      if (p < 1) animRef.current = { raf: requestAnimationFrame(step) };
    };
    animRef.current = { raf: requestAnimationFrame(step) };
  };

  const onEnter = () => startAnim(text.length, 700);

  const resolved = revealed === null ? text : text.slice(0, revealed);
  const leftover = revealed === null ? "" : text.slice(revealed);

  return (
    <span
      onMouseEnter={onEnter}
      className={className}
      aria-label={text}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden className="noise-scramble inline">
        {revealed === null ? text : resolved}
        {revealed === null || revealed >= text.length ? null : (
          <span className="noise">{garble(leftover)}</span>
        )}
      </span>
    </span>
  );
}