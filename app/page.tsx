"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type Stroke = { x: number; y: number };

type Card = {
  name: string;
  number: string;
};

const DEFAULT_CARD: Card = {
  name: "CloudGlides",
  number: "000001",
};

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2">
      <span className="font-mono text-sm font-bold text-hc-red">~$</span>
      <span className="font-mono text-sm font-bold uppercase tracking-tight text-white">
        whoami
      </span>
    </a>
  );
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Logo />
        <div className="hidden items-center gap-8 font-mono text-base uppercase tracking-wide text-zinc-400 sm:flex">
          <a href="#how" className="transition-colors hover:text-white">
            How it works
          </a>
          <a href="#sign" className="transition-colors hover:text-white">
            Sign yours
          </a>
          <a href="#passport" className="transition-colors hover:text-white">
            The passport
          </a>
          <a href="#faq" className="transition-colors hover:text-white">
            FAQ
          </a>
        </div>
        <a
          href="https://hackclub.com/slack"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-hc-red px-4 py-2 font-mono text-sm font-bold uppercase tracking-wide text-white shadow-[3px_3px_0_#fff] transition hover:-translate-y-0.5"
        >
          Join the Slack
        </a>
      </nav>
    </header>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 18" fill="none" className={className} aria-hidden>
      <path d="M0 0h24v9H0z" fill="#FF6B00" />
      <path d="M0 9h24v9H0z" fill="#FFBF00" />
      <path d="M7 0h3v18H7z" fill="#111" />
      <path d="M7 0h10v3H7z" fill="#111" />
    </svg>
  );
}

function Barcode({ className }: { className?: string }) {
  const bars = [3, 1, 2, 1, 4, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1];
  return (
    <svg
      viewBox="0 0 60 28"
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      {bars.map((w, i) => {
        const x = bars.slice(0, i).reduce((a, b) => a + b, 0);
        return <rect key={i} x={x} y={2} width={w} height={24} fill="currentColor" />;
      })}
    </svg>
  );
}

function EMVChip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 28" className={className} aria-hidden>
      <rect width="40" height="28" rx="5" fill="#111" />
      <path
        d="M9 0v10M17 0v10M25 0v10M31 0v10M0 10h40M0 17h40"
        stroke="#fafafa"
        strokeWidth="1.2"
        opacity="0.9"
        fill="none"
      />
      <rect x="5" y="20" width="4" height="4" rx="1" fill="#fafafa" opacity="0.85" />
    </svg>
  );
}

function Avatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 80" className={className} aria-hidden>
      <rect width="64" height="80" fill="#0a0a0a" />
      <circle cx="32" cy="27" r="13" fill="#fafafa" />
      <rect x="24" y="23" width="16" height="8" rx="1" fill="#e42d40" />
      <path d="M8 80c2-18 13-26 24-26s22 8 24 26H8z" fill="#fafafa" />
    </svg>
  );
}

function Scribble({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 24" className={className} aria-hidden>
      <path
        d="M4 16c8-12 14 6 22-4s12 10 20-2 12 8 22-6 16 12 24-2"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IDCard({
  className = "",
  name = DEFAULT_CARD.name,
  number = DEFAULT_CARD.number,
  signature,
}: {
  className?: string;
  name?: string;
  number?: string;
  signature?: Stroke[][];
}) {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="flex aspect-[1.586/1] w-full flex-col overflow-hidden rounded-xl border-2 border-black bg-white shadow-[10px_10px_0_#e42d40]">
        <div className="flex items-center justify-between bg-hc-red px-5 py-2.5 text-white">
          <div className="flex items-center gap-2.5">
            <FlagIcon className="h-4 w-6 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
                Hack Club
              </p>
              <p className="-mt-0.5 font-mono text-[7px] uppercase tracking-[0.3em] text-white/80">
                International Hacker
              </p>
            </div>
          </div>
          <span className="bg-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest">
            ID
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3 p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              <div className="relative h-20 w-16 overflow-hidden rounded-sm border border-zinc-300">
                <Avatar className="h-full w-full" />
                <div className="absolute -bottom-1.5 -right-1.5 h-10 w-10 rounded-full p-[3px] shadow-[0_0_0_2px_#0a0a0a]">
                  <div className="holo-foil h-full w-full rounded-full" />
                  <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-white">
                    <FlagIcon className="h-3.5 w-5" />
                  </div>
                </div>
              </div>
              <EMVChip className="h-7 w-10" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-500">
                Cardholder
              </p>
              <p className="truncate font-mono text-lg font-bold uppercase text-black sm:text-xl">
                {name}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <div className="border border-zinc-300 px-1.5 py-1">
                  <p className="font-mono text-[7px] uppercase tracking-widest text-zinc-500">
                    Member #
                  </p>
                  <p className="font-mono text-xs font-bold text-black">
                    {number}
                  </p>
                </div>
                <div className="bg-hc-red px-1.5 py-1">
                  <p className="font-mono text-[7px] uppercase tracking-widest text-white/80">
                    Status
                  </p>
                  <p className="font-mono text-xs font-bold text-white">
                    VALID
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
                Authorized signature
              </p>
              {signature && signature.length > 0 ? (
                <SignatureStamp signature={signature} />
              ) : (
                <Scribble className="h-6 w-24 text-zinc-800" />
              )}
              <p className="font-mono text-[7px] uppercase tracking-widest text-zinc-400">
                Cardholder
              </p>
            </div>
            <div className="text-right">
              <Barcode className="h-7 w-20 text-hc-red" />
              <p className="font-mono text-[7px] uppercase tracking-widest text-zinc-400">
                hackclub.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-3 -right-3 rotate-[-8deg] border-2 border-hc-red bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-hc-red shadow-[2px_2px_0_#0a0a0a]">
        valid forever
      </div>
    </div>
  );
}

function SignatureStamp({ signature }: { signature: Stroke[][] }) {
  const pts = signature.flat();
  let minX = 400;
  let minY = 200;
  let maxX = 0;
  let maxY = 0;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const pad = 12;
  const vx = Math.max(0, minX - pad);
  const vy = Math.max(0, minY - pad);
  const vw = Math.max(4, Math.min(400, maxX + pad) - vx);
  const vh = Math.max(4, Math.min(200, maxY + pad) - vy);
  return (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="h-8 w-28" aria-hidden>
      {signature.map((s, i) => (
        <polyline
          key={i}
          fill="none"
          stroke="#0a0a0a"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          points={s.map((p) => `${p.x},${p.y}`).join(" ")}
        />
      ))}
    </svg>
  );
}

function SignPad({
  strokes,
  onChange,
}: {
  strokes: Stroke[][];
  onChange: (next: Stroke[][]) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const drawingRef = useRef(false);

  const toPoint = (e: ReactPointerEvent<SVGSVGElement>): Stroke => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 400,
      y: ((e.clientY - rect.top) / rect.height) * 200,
    };
  };

  function down(e: ReactPointerEvent<SVGSVGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    onChange([...strokes, [toPoint(e)]]);
  }

  function move(e: ReactPointerEvent<SVGSVGElement>) {
    if (!drawingRef.current) return;
    const next = [...strokes];
    next[next.length - 1] = [...next[next.length - 1], toPoint(e)];
    onChange(next);
  }

  function up() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const last = strokes[strokes.length - 1];
    if (last && last.length < 2) onChange(strokes.slice(0, -1));
  }

  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border-2 border-black bg-white shadow-[8px_8px_0_#e42d40]">
      <div className="pointer-events-none absolute inset-x-6 bottom-4 font-mono text-sm uppercase tracking-[0.25em] text-zinc-400">
        sign here
      </div>
      <div className="pointer-events-none absolute inset-x-6 bottom-8 border-b-2 border-dashed border-zinc-300" />
      <svg
        ref={svgRef}
        viewBox="0 0 400 200"
        role="img"
        aria-label="signature pad"
        className="absolute inset-0 h-full w-full cursor-crosshair touch-none select-none"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        {strokes.map((s, i) => (
          <polyline
            key={i}
            fill="none"
            stroke="#0a0a0a"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            points={s.map((p) => `${p.x},${p.y}`).join(" ")}
          />
        ))}
      </svg>
    </div>
  );
}

function SignSection({
  card,
  onCardChange,
  signature,
  onSign,
  onClear,
}: {
  card: Card;
  onCardChange: (patch: Partial<Card>) => void;
  signature: Stroke[][];
  onSign: (next: Stroke[][]) => void;
  onClear: () => void;
}) {
  return (
    <section
      id="sign"
      className="relative overflow-hidden border-y border-white/10 bg-black px-6 py-28 text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem]"
      />
      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-20 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <p className="font-mono text-base font-bold uppercase tracking-widest text-hc-red">
            [03] make it yours
          </p>
          <h2 className="mt-4 font-mono text-4xl font-bold uppercase tracking-tight sm:text-6xl">
            Make your ID
          </h2>
          <p className="mt-6 max-w-md text-xl leading-relaxed text-zinc-400">
            go ahead, it&apos;s yours. the card up top updates as you type.
          </p>

          <div className="mt-10 space-y-5">
            <div>
              <label
                htmlFor="whoami-name"
                className="font-mono text-sm uppercase tracking-widest text-zinc-500"
              >
                name
              </label>
              <input
                id="whoami-name"
                type="text"
                value={card.name}
                maxLength={18}
                onChange={(e) => onCardChange({ name: e.target.value })}
                className="mt-2 w-full border-2 border-black bg-white px-3 py-2.5 font-mono text-base font-bold uppercase tracking-wide text-black focus:shadow-[4px_4px_0_#e42d40] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="whoami-number"
                className="font-mono text-sm uppercase tracking-widest text-zinc-500"
              >
                member #
              </label>
              <input
                id="whoami-number"
                type="text"
                value={card.number}
                maxLength={8}
                onChange={(e) => onCardChange({ number: e.target.value })}
                className="mt-2 w-full border-2 border-black bg-white px-3 py-2.5 font-mono text-base font-bold uppercase tracking-wide text-black focus:shadow-[4px_4px_0_#e42d40] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={onClear}
              disabled={signature.length === 0}
              className="border-2 border-white bg-transparent px-5 py-2.5 font-mono text-base font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              clear
            </button>
            {signature.length > 0 ? (
              <a
                href="#top"
                className="bg-hc-red px-5 py-2.5 font-mono text-base font-bold uppercase tracking-wide text-white shadow-[3px_3px_0_#fff] transition hover:-translate-y-0.5"
              >
                see it on your card ↑
              </a>
            ) : null}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SignPad strokes={signature} onChange={onSign} />
          <p className="mt-6 font-mono text-base uppercase tracking-widest text-zinc-500">
            a mouse or your finger works fine
          </p>
        </div>
      </div>
    </section>
  );
}

const stickerSlots = [
  { name: "whoami", earned: true },
  { name: "sprig", earned: false },
  { name: "smelt", earned: false },
  { name: "keeb", earned: false },
  { name: "orpheus", earned: false },
  { name: "???", earned: false },
];

function PassportMock({
  className = "",
  name = DEFAULT_CARD.name,
  number = DEFAULT_CARD.number,
}: {
  className?: string;
  name?: string;
  number?: string;
}) {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="flex aspect-[1.586/1] w-full overflow-hidden rounded-xl border-2 border-black bg-white shadow-[10px_10px_0_#e42d40]">
        <div className="flex w-1/2 flex-col justify-between border-r-2 border-black bg-black p-5 text-white">
          <div className="flex items-center gap-2">
            <FlagIcon className="h-4 w-6 rounded-[2px]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
              Hack Club
            </span>
          </div>
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-400">
              Passport of
            </p>
            <p className="truncate font-mono text-lg font-bold uppercase text-white">
              {name}
            </p>
            <div className="mt-3 space-y-1 font-mono text-[8px] uppercase tracking-widest text-zinc-400">
              <p>No: HC-{number}</p>
              <p>Issued: tbd</p>
              <p>Valid: forever</p>
            </div>
          </div>
          <p className="font-mono text-[7px] uppercase tracking-[0.25em] text-hc-red">
            ysws sticker collector
          </p>
        </div>

        <div className="flex w-1/2 flex-col p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-500">
              Stickers
            </p>
            <p className="font-mono text-[8px] uppercase tracking-widest text-hc-red">
              1/6
            </p>
          </div>
          <div className="mt-3 grid flex-1 grid-cols-3 gap-1.5">
            {stickerSlots.map((s) =>
              s.earned ? (
                <div
                  key={s.name}
                  className="flex items-center justify-center border-2 border-hc-red bg-hc-red/5"
                >
                  <div className="flex aspect-square w-4/5 items-center justify-center rounded-full border-[3px] border-hc-red text-center">
                    <span className="font-mono text-[8px] font-bold uppercase leading-tight text-hc-red">
                      whoami
                      <br />
                      5h
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={s.name}
                  className="flex items-center justify-center border-2 border-dashed border-zinc-300 text-center"
                >
                  <span className="px-0.5 font-mono text-[7px] uppercase tracking-widest text-zinc-400">
                    {s.name}
                  </span>
                </div>
              )
            )}
          </div>
          <p className="mt-3 font-mono text-[7px] uppercase tracking-widest text-zinc-400">
            one sticker per ysws shipped
          </p>
        </div>
      </div>

      <div className="absolute -right-3 -top-4 rotate-6 border-2 border-black bg-white px-3 py-1 font-mono text-xs font-bold uppercase text-black shadow-[3px_3px_0_#e42d40]">
        stamp: collected
      </div>
    </div>
  );
}

function Hero({ card, signature }: { card: Card; signature: Stroke[][] }) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-black px-6 pb-28 pt-36 text-white sm:pt-44"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem]"
      />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-20 lg:grid-cols-2">
        <div>
          <p className="inline-flex items-center gap-2 border-2 border-white px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-white">
            <span className="h-2 w-2 bg-hc-red" />
            [01] a hack club ysws
          </p>

          <h1 className="mt-8 font-mono text-[2.75rem] font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-6xl">
            Ship 5
            <br />
            hours.
            <br />
            <span className="text-hc-red">Get your ID.</span>
          </h1>

          <p className="mt-6 max-w-md text-xl leading-relaxed text-zinc-400">
            whoami is a ysws i run with friends from the hack club slack. build
            identity-related software for 5 hours and we&apos;ll print you a
            hack club ID card and put it in the mail. that&apos;s it, that&apos;s
            the whole program.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <a
              href="https://hackclub.com/slack"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-hc-red px-7 py-3 font-mono text-lg font-bold uppercase tracking-wide text-white shadow-[5px_5px_0_#fff] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#fff]"
            >
              Start shipping
            </a>
            <a
              href="#how"
              className="border-2 border-white px-7 py-3 font-mono text-lg font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
            >
              How it works
            </a>
          </div>

          <p className="mt-8 font-mono text-sm uppercase tracking-widest text-zinc-500">
            we pay shipping everywhere, you pay nothing
          </p>
        </div>

        <div className="relative">
          <IDCard
            className="rotate-2 transition-transform duration-300 hover:rotate-0"
            name={card.name}
            number={card.number}
            signature={signature}
          />
          <p className="absolute -right-3 -top-4 rotate-6 border-2 border-black bg-white px-3 py-1 font-mono text-xs font-bold uppercase text-black shadow-[3px_3px_0_#e42d40]">
            you_are_here
          </p>
          <p className="absolute -bottom-2 -left-3 -rotate-3 border-2 border-black bg-white px-3 py-1 font-mono text-xs font-bold uppercase text-black shadow-[3px_3px_0_#e42d40]">
            proof_of_ship
          </p>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    num: "01",
    title: "Join the Slack",
    href: "https://app.slack.com/client/E09V59WQY1E/C0BM1L56D19",
    body: "find #whoami in the hack club slack and say hi. the rules fit on one page and they're mostly common sense.",
  },
  {
    num: "02",
    title: "Build for 5 hours",
    body: "identity-related software. a login system, an auth tool, a name generator, whatever fits. track 5 real hours in hackatime, or a notes app if you'd rather. we're not picky.",
  },
  {
    num: "03",
    title: "Ship it, get your ID",
    body: "ship your project. your card goes in the mail. that part we're sure about.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="bg-zinc-50 px-6 py-28 text-black">
      <div className="mx-auto w-full max-w-5xl">
        <p className="font-mono text-base font-bold uppercase tracking-widest text-hc-red">
          [02] How it works
        </p>
        <h2 className="mt-4 font-mono text-4xl font-bold uppercase tracking-tight sm:text-6xl">
          Three steps to an ID
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {steps.map((s) => {
            const cls =
              "block border-2 border-black bg-white p-6 shadow-[6px_6px_0_#e42d40] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#e42d40]";
            const inner = (
              <>
                <span className="inline-block bg-hc-red px-2.5 py-1 font-mono text-sm font-bold text-white">
                  {s.num}
                </span>
                <h3 className="mt-5 font-mono text-xl font-bold uppercase tracking-wide">
                  {s.title}
                  {s.href ? (
                    <span className="ml-2 text-hc-red" aria-hidden>
                      →
                    </span>
                  ) : null}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-zinc-600">
                  {s.body}
                </p>
              </>
            );
            return s.href ? (
              <a
                key={s.num}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
              >
                {inner}
              </a>
            ) : (
              <div key={s.num} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const passportSteps = [
  { num: "1", label: "Finish a YSWS" },
  { num: "2", label: "Earn a sticker" },
  { num: "3", label: "Stick it in the passport" },
];

function PassportSection({ name, number }: { name: string; number: string }) {
  return (
    <section id="passport" className="bg-zinc-50 px-6 py-28 text-black">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-20 lg:grid-cols-2">
        <div>
          <p className="font-mono text-base font-bold uppercase tracking-widest text-hc-red">
            [04] the passport
          </p>
          <h2 className="mt-4 font-mono text-4xl font-bold uppercase tracking-tight sm:text-6xl">
            One passport, every YSWS
          </h2>
          <p className="mt-6 max-w-md text-xl leading-relaxed text-zinc-600">
            whoami is your first stamp. after that, every ysws you finish adds
            another one. the fine print is still being written.
          </p>

          <div className="mt-10 space-y-5">
            {passportSteps.map((s) => (
              <div
                key={s.num}
                className="flex items-center gap-4 border-2 border-black bg-white px-5 py-4 shadow-[4px_4px_0_#e42d40]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-hc-red font-mono text-sm font-bold text-white">
                  {s.num}
                </span>
                <p className="font-mono text-base font-bold uppercase tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 font-mono text-base uppercase tracking-widest text-zinc-500">
            the stickers are real, you actually stick them in
          </p>
        </div>

        <div className="relative">
          <PassportMock
            name={name}
            number={number}
            className="rotate-2 transition-transform duration-300 hover:rotate-0"
          />
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "How many hours do I need?",
    a: "5 hours of identity software gets you the ID card. past that, there's more, we just haven't fully decided what. any time you're actually making something counts, coding, drawing, debugging, or reinstalling arch for the third time. timestamped screenshots are the easiest proof.",
  },
  {
    q: "What should I build?",
    a: "anything identity-related. a login system, an auth tool, a name generator, a whoami for your website. one person is building a robot that yells at their homework about passwords. just finish it.",
  },
  {
    q: "Do I need to be good at coding?",
    a: "no. if you can type whoami in a terminal you qualify. if you can't, we'll show you.",
  },
  {
    q: "How much does this cost?",
    a: "zero. the card, the passport, the stickers, the shipping. we pay for all of it, you just put in the hours.",
  },
  {
    q: "How long does shipping take?",
    a: "once you're done, your stuff is in the mail within a few days. plan on one to three weeks after that, depending on where you live.",
  },
  {
    q: "Am I eligible?",
    a: "if you're in the hack club slack and between 13 and 19, yes. that's the whole requirement.",
  },
];

function FAQ() {
  return (
    <section
      id="faq"
      className="relative overflow-hidden border-y border-white/10 bg-black px-6 py-28 text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem]"
      />
      <div className="relative mx-auto w-full max-w-3xl">
        <p className="font-mono text-base font-bold uppercase tracking-widest text-hc-red">
          [05] faq
        </p>
        <h2 className="mt-4 font-mono text-4xl font-bold uppercase tracking-tight sm:text-6xl">
          Questions? ok.
        </h2>

        <div className="mt-14 space-y-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group border-2 border-white/20 bg-white/[0.03] px-6 py-5 transition-colors open:border-hc-red open:shadow-[4px_4px_0_#e42d40]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-mono text-lg font-bold uppercase tracking-wide [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="shrink-0 text-hc-red transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="grid transition-[grid-template-rows] duration-300 ease-out [grid-template-rows:0fr] group-open:[grid-template-rows:1fr]">
                <div className="overflow-hidden">
                  <p className="mt-3 text-base leading-relaxed text-zinc-400">
                    {f.a}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo />
        <p className="font-mono text-base uppercase tracking-wide text-zinc-500">
          made with <span className="text-hc-red">♥</span> by hackers
        </p>
        <a
          href="https://hackclub.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-base font-bold uppercase tracking-wide text-hc-red transition-colors hover:text-white"
        >
          hackclub.com →
        </a>
      </div>
    </footer>
  );
}

export default function Home() {
  const [card, setCard] = useState<Card>(DEFAULT_CARD);
  const [signature, setSignature] = useState<Stroke[][]>([]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-hc-red selection:text-white">
      <Nav />
      <main>
        <Hero card={card} signature={signature} />
        <HowItWorks />
        <SignSection
          card={card}
          onCardChange={(patch) => setCard((prev) => ({ ...prev, ...patch }))}
          signature={signature}
          onSign={setSignature}
          onClear={() => setSignature([])}
        />
        <PassportSection name={card.name} number={card.number} />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
