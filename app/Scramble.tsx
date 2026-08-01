"use client";

import { useEffect, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}#*+=?^";

export default function Scramble({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const total = 26;
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        frame += 1;
        const reveal = Math.floor((frame / total) * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          if (i < reveal) out += text[i];
          else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setDisplay(out);
        if (frame >= total) {
          setDisplay(text);
          if (interval) clearInterval(interval);
        }
      }, 28);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [text, delay]);

  return <span className={className}>{display}</span>;
}
