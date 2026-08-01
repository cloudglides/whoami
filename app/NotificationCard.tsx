"use client";

import { useState } from "react";

const FORM_URL = "https://whoami.fillout.com/t/d7HP8yRWyxus";

export default function NotificationCard() {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const dismiss = () => setHidden(true);

  return (
    <div
      className="notify-in fixed right-5 top-20 z-40 w-[320px] max-w-[calc(100vw-2.5rem)] border-2 border-hc-red bg-surface p-5 text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]"
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="absolute right-3 top-3 font-mono text-lg leading-none text-muted transition-colors hover:text-ink"
      >
        ×
      </button>
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-hc-red">
        rsvp
      </p>
      <h3 className="mt-2 font-display text-2xl uppercase tracking-tight">
        make this draft real
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        the card and passport are still drafts. rsvp and we&apos;ll turn them
        into something real.
      </p>
      <a
        href={FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block bg-hc-red px-4 py-2 font-mono text-sm font-bold uppercase tracking-wide text-white transition hover:-translate-y-0.5"
      >
        rsvp →
      </a>
    </div>
  );
}
