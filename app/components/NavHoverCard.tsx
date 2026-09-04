"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const navItems: {
  href: string;
  label: string;
  external?: boolean;
  mailto?: boolean;
  cardTitle?: string;
  cardLinks?: { text: string; url: string }[];
}[] = [
  {
    href: "/how-it-works",
    label: "How it works",
    cardTitle: "How it works",
    cardLinks: [
      { text: "What's Hackatime?", url: "https://hackatime.hackclub.com" },
      { text: "How will the passport look?", url: "https://hackclub.com" },
      { text: "What's the usecase?", url: "https://hackclub.com" },
    ],
  },
  {
    href: "mailto:passports@hackclub.com",
    label: "For organizers",
    mailto: true,
    cardTitle: "For organizers",
    cardLinks: [],
  },
  {
    href: "https://whoami.fillout.com/t/d7HP8yRWyxus",
    label: "RSVP",
    external: true,
  },
];

export default function NavHoverCard() {
  const [active, setActive] = useState<number | null>(null);
  const [cardLeft, setCardLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText("passports@hackclub.com");
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  function updateCard(index: number) {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setActive(index);
    const nav = navRef.current;
    const link = linkRefs.current[index];
    if (!nav || !link) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const cardW = Math.min(340, window.innerWidth - 32);
    let left = linkRect.left - navRect.left + linkRect.width / 2 - cardW / 2;
    left = Math.max(16 - navRect.left, Math.min(left, navRect.width - cardW - 16));
    setCardLeft(left);
  }

  function scheduleHide() {
    hideTimer.current = setTimeout(() => setActive(null), 120);
  }

  function cancelHide() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }

  return (
    <nav aria-label="Primary" ref={navRef} className="relative">
      <ul className="flex items-center gap-1 p-1.5 text-sm font-semibold sm:gap-2">
        {navItems.map((item, i) =>
          item.external ? (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 rounded-full px-2.5 py-1.5 no-underline text-white transition-colors hover:bg-white/25 sm:px-3"
              >
                {item.label}
              </a>
            </li>
          ) : (
            <li key={item.href}>
              {item.mailto ? (
                <a
                  href={item.href}
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  className="relative z-10 rounded-full px-2.5 py-1.5 no-underline text-white transition-colors hover:bg-white/25 sm:px-3"
                  onMouseEnter={() => updateCard(i)}
                  onMouseLeave={scheduleHide}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={item.href}
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  className="relative z-10 rounded-full px-2.5 py-1.5 no-underline text-white transition-colors hover:bg-white/25 sm:px-3"
                  onMouseEnter={() => updateCard(i)}
                  onMouseLeave={scheduleHide}
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        )}
      </ul>

      <div
        className="absolute top-full z-[100] mt-2 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-lg shadow-xl transition-all duration-300 ease-out nav-card-stripes"
        style={{
          left: cardLeft,
          opacity: active !== null ? 1 : 0,
          transform:
            active !== null ? "translateY(0)" : "translateY(-4px)",
          border: "2px solid #ff902f",
        }}
        onMouseEnter={cancelHide}
        onMouseLeave={scheduleHide}
      >
        <div className="bg-white px-6 py-5">
          <p className="text-lg font-bold text-govuk-black">
            {active !== null && navItems[active].cardTitle
              ? navItems[active].cardTitle
              : ""}
          </p>
          {active !== null && navItems[active].mailto ? (
            <p className="mt-1 text-sm leading-relaxed text-govuk-grey-4">
              Interested in including PASSPORT/ID in your YSWS shop? Reach out
              to the email below.
            </p>
          ) : null}
          <ul className="mt-2 space-y-1">
            {(active !== null && navItems[active].cardLinks
              ? navItems[active].cardLinks
              : []
            ).map(
              (link) => (
                <li key={link.text}>
                  <a
                    href={link.url}
                    {...(link.url.startsWith("mailto:")
                      ? {}
                      : { target: "_blank", rel: "noopener noreferrer" })}
                    className="text-sm text-govuk-blue underline underline-offset-2 transition-colors hover:text-govuk-blue-hover"
                  >
                    {link.text}
                  </a>
                </li>
              )
            )}
          </ul>
          {active !== null && navItems[active].mailto ? (
            <div className="mt-4 flex items-center gap-2 border-t border-govuk-grey-2 pt-3">
              <a
                href="mailto:passports@hackclub.com"
                className="text-sm font-semibold text-govuk-blue underline underline-offset-2 transition-colors hover:text-govuk-blue-hover"
              >
                passports@hackclub.com
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="ml-auto rounded border border-govuk-black bg-govuk-white px-2 py-1 text-xs font-semibold text-govuk-black transition-colors hover:bg-govuk-grey-1"
              >
                {copied ? "Copied!" : "Copy email"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}