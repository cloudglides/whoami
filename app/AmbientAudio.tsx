"use client";

import { useEffect, useRef, useState } from "react";

const OGG = "/strudel/2026-08-01T21_30_47.669Z.ogg";
const WAV = "/strudel/2026-08-01T21_30_47.669Z.wav";

export default function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.45;
    audio.preload = "auto";
    audio.innerHTML = `
      <source src="${OGG}" type="audio/ogg" />
      <source src="${WAV}" type="audio/wav" />
    `;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audioRef.current = audio;

    const start = (e: Event) => {
      if (
        e.target instanceof Element &&
        e.target.closest("[data-sound-toggle]")
      ) {
        return;
      }
      cleanup();
      audio.play().catch(() => {});
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", start, true);
      window.removeEventListener("keydown", start, true);
      window.removeEventListener("touchstart", start, true);
      window.removeEventListener("wheel", start, true);
      window.removeEventListener("scroll", start, true);
    };
    window.addEventListener("pointerdown", start, true);
    window.addEventListener("keydown", start, true);
    window.addEventListener("touchstart", start, true);
    window.addEventListener("wheel", start, true);
    window.addEventListener("scroll", start, true);

    audio.play().catch(() => {});

    return () => {
      cleanup();
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  return (
    <button
      data-sound-toggle
      onClick={toggle}
      aria-label={playing ? "Pause background sound" : "Play background sound"}
      className="fixed bottom-5 right-5 z-50 border-2 border-white bg-black px-3 py-2 font-mono text-sm font-bold uppercase tracking-wide text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.7)] transition hover:-translate-y-0.5"
    >
      {playing ? "mute" : "play"}
    </button>
  );
}
