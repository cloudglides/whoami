"use client";

import { useState } from "react";

const FORM_URL = "https://whoami.fillout.com/t/d7HP8yRWyxus";

export default function NotificationCard() {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="notify-in fixed bottom-5 right-5 z-40 flex w-[320px] max-w-[calc(100vw-2.5rem)] flex-col gap-3 rounded-xl border border-white/20 bg-white/10 p-5 text-foreground shadow-[0_8px_30px_-8px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-hc-red">
          rsvp
        </p>
        <button
          onClick={() => setHidden(true)}
          aria-label="Dismiss notification"
          className="font-mono text-lg leading-none text-muted transition-colors hover:text-foreground"
        >
          ×
        </button>
      </div>
      <p className="text-sm font-medium">
        the card and passport are still drafts. rsvp and we&apos;ll turn them
        into something real.
      </p>
      <a
        href={FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-fit border border-hc-red px-4 py-1.5 font-mono text-sm font-bold uppercase tracking-wide text-hc-red transition-colors hover:bg-hc-red hover:text-white"
      >
        rsvp →
      </a>
    </div>
  );
}