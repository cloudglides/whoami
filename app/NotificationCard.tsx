"use client";

import { useState } from "react";

const FORM_URL = "https://whoami.fillout.com/t/d7HP8yRWyxus";

export default function NotificationCard() {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div
      className="notify-in fixed bottom-5 right-5 z-50 flex w-[300px] max-w-[calc(100vw-2.5rem)] flex-col gap-3 border border-paper/25 bg-ink-deep/95 p-5 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.14em] text-lavender">
          rsvp
        </p>
        <button
          onClick={() => setHidden(true)}
          aria-label="Dismiss notification"
          className="grid h-7 w-7 place-items-center border-0 bg-transparent p-0 font-serif text-xl text-paper-dim transition-colors hover:text-lavender"
        >
          ×
        </button>
      </div>
      <p className="font-body text-[0.95rem] leading-relaxed text-paper">
        the card and passport are still drafts. rsvp and we&apos;ll turn them
        into something real.
      </p>
      <a
        href={FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-fit border-0 bg-transparent p-0 font-serif text-lg text-lavender no-underline transition-colors hover:text-lavender-dim"
      >
        [ rsvp ]
      </a>
    </div>
  );
}
