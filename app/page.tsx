import Reveal from "./Reveal";
import Scramble from "./Scramble";
import ThemeToggle from "./ThemeToggle";
import Tilt from "./Tilt";

function Logo() {
  return (
    <a href="#top" className="flex items-baseline gap-2">
      <span className="font-mono text-sm font-bold text-hc-red">~$</span>
      <span className="font-display text-xl text-ink">whoami</span>
    </a>
  );
}

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Logo />
        <div className="hidden items-center gap-8 font-mono text-base uppercase tracking-wide text-muted sm:flex">
          <a href="#how" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#passport" className="transition-colors hover:text-ink">
            The passport
          </a>
          <a href="#faq" className="transition-colors hover:text-ink">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle className="border border-line-strong px-2.5 py-1.5 text-muted transition-colors hover:text-ink" />
          <a
            href="https://hackclub.com/slack"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-hc-red px-4 py-2 font-mono text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_14px_-6px_rgba(228,45,64,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-6px_rgba(228,45,64,0.7)] active:translate-y-0 active:shadow-none"
          >
            Join the Slack
          </a>
        </div>
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

function IDCard({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="card-sheen card-texture relative flex aspect-[1.586/1] w-full flex-col overflow-hidden rounded-xl border-2 border-black bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.55)]">
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

        <div className="relative flex flex-1 flex-col justify-between gap-3 p-5 sm:p-6">
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
                CloudGlides
              </p>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <div className="border border-zinc-300 px-1.5 py-1">
                  <p className="font-mono text-[7px] uppercase tracking-widest text-zinc-500">
                    Member #
                  </p>
                  <p className="font-mono text-xs font-bold text-black">
                    000001
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
              <Scribble className="h-6 w-24 text-zinc-800" />
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

        <div className="card-holo" />
        <p className="absolute inset-x-0 bottom-1 text-center font-mono text-[5px] uppercase tracking-[0.35em] text-zinc-300">
          hack club · identity division · vermont
        </p>
      </div>

      <div className="sticker-gloss absolute -bottom-3 -right-3 rotate-[-8deg] border-2 border-hc-red bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-hc-red shadow-[0_6px_16px_-8px_rgba(0,0,0,0.45)]">
        valid forever
      </div>
    </div>
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

function PassportMock({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="book relative">
        <div className="flex aspect-[1.586/1] w-full overflow-hidden rounded-xl border-2 border-black bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.55)]">
          <div className="book-left relative flex w-1/2 flex-col justify-between border-r-2 border-black bg-black p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FlagIcon className="h-4 w-6 rounded-[2px]" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                    Hack Club
                  </span>
                </div>
                <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.3em] text-zinc-400">
                  official ysws passport
                </p>
              </div>
              <div className="relative h-10 w-10 rounded-full p-[2px] shadow-[0_0_0_2px_rgba(250,250,250,0.3)]">
                <div className="holo-foil h-full w-full rounded-full" />
                <div className="absolute inset-[2px] flex items-center justify-center rounded-full bg-black">
                  <FlagIcon className="h-3 w-4.5" />
                </div>
              </div>
            </div>

            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-400">
                Passport of
              </p>
              <p className="truncate font-mono text-lg font-bold uppercase text-white">
                CloudGlides
              </p>
              <div className="mt-3 space-y-1 font-mono text-[8px] uppercase tracking-widest text-zinc-400">
                <p>No: HC-000001</p>
                <p>Issued: tbd</p>
                <p>Valid: forever</p>
              </div>
            </div>

            <p className="font-mono text-[7px] uppercase tracking-[0.25em] text-hc-red">
              ysws sticker collector
            </p>
            <div className="absolute -left-[5px] bottom-1 top-1 w-[7px] rounded-l-[3px] bg-[repeating-linear-gradient(to_bottom,#1c1c1c_0_1px,#0a0a0a_1px_2px)]" />
          </div>

          <div className="book-right relative flex w-1/2 flex-col p-4">
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
                    <div className="sticker-gloss relative flex aspect-square w-4/5 items-center justify-center rounded-full border-[3px] border-hc-red text-center">
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
            <div className="flex items-end justify-between">
              <p className="font-mono text-[7px] uppercase tracking-widest text-zinc-400">
                one sticker per ysws shipped
              </p>
              <p className="font-mono text-[7px] uppercase tracking-widest text-zinc-400">
                p.01
              </p>
            </div>
            <div className="page-edge-right" />
          </div>

          <div className="passport-gutter" />
        </div>
      </div>

      <div className="stamp-ink absolute -right-3 -top-4 rotate-6 border-[3px] border-double border-hc-red/70 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide text-hc-red/80">
        sticker: collected
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-surface px-6 pb-28 pt-36 text-ink sm:pt-44"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px)] bg-[size:3rem_3rem]"
      />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-20 lg:grid-cols-2">
        <div>
          <p className="inline-flex items-center gap-2 border border-line-strong px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-ink">
            <span className="h-2 w-2 bg-hc-red" />
            [01] a hack club ysws
          </p>

          <h1 className="mt-8 font-display text-[3.2rem] uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-6xl">
            <Scramble text="Ship 5" delay={0} />
            <br />
            <Scramble
              text="hours."
              delay={150}
              className="text-transparent [-webkit-text-stroke:2px_var(--ink)]"
            />
            <br />
            <Scramble
              text="Get your own Hack Club ID."
              delay={300}
              className="text-hc-red"
            />
          </h1>

          <p className="mt-6 max-w-md text-xl leading-relaxed text-muted">
            whoami is a ysws i run with friends from the hack club slack. build
            identity-related software for 5 hours. once the ysws ends, we get
            the cards fabricated and mail them out. it&apos;s just a little
            memory of the ysws you were part of. that&apos;s it, that&apos;s the
            whole program.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <a
              href="https://hackclub.com/slack"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-hc-red px-7 py-3 font-mono text-lg font-bold uppercase tracking-wide text-white shadow-[0_10px_30px_-10px_rgba(228,45,64,0.7)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-10px_rgba(228,45,64,0.8)] active:translate-y-[2px] active:shadow-[0_4px_12px_-6px_rgba(228,45,64,0.5)]"
            >
              Start shipping
            </a>
            <a
              href="#how"
              className="border border-line-strong px-7 py-3 font-mono text-lg font-bold uppercase tracking-wide text-ink transition hover:border-ink hover:bg-ink/[0.06] active:translate-y-[2px]"
            >
              How it works
            </a>
          </div>

          <p className="mt-8 font-mono text-sm uppercase tracking-widest text-faint">
            get your own hackclub ID
          </p>
        </div>

        <div className="animate-float">
          <Tilt>
            <div className="relative">
              <IDCard className="rotate-2" />
            </div>
          </Tilt>
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
    <section
      id="how"
      className="border-t border-line bg-surface px-6 py-28 text-ink sm:py-32"
    >
      <div className="mx-auto w-full max-w-5xl">
        <Reveal>
          <p className="font-mono text-base font-bold uppercase tracking-widest text-hc-red">
            [02] How it works
          </p>
          <h2 className="mt-4 font-display text-5xl uppercase tracking-tight sm:text-6xl">
            Three steps to an ID
          </h2>
        </Reveal>

        <div className="mt-14 divide-y divide-line border-y border-line">
          {steps.map((s, i) => {
            const row = (
              <div className="flex flex-col gap-4 py-8 sm:flex-row sm:items-baseline sm:gap-12">
                <span className="font-display text-5xl leading-none text-hc-red sm:w-24">
                  {s.num}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">
                    {s.title}
                    {s.href ? (
                      <span
                        className="ml-3 inline-block text-hc-red transition-transform group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    ) : null}
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                    {s.body}
                  </p>
                </div>
              </div>
            );
            return (
              <Reveal key={s.num} delay={i * 120}>
                {s.href ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block transition-colors hover:bg-ink/[0.04]"
                  >
                    {row}
                  </a>
                ) : (
                  <div>{row}</div>
                )}
              </Reveal>
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

function PassportSection() {
  return (
    <section
      id="passport"
      className="border-t border-line bg-surface px-6 py-28 text-ink sm:py-32"
    >
      <div className="mx-auto grid w-full max-w-5xl items-center gap-20 lg:grid-cols-2">
        <div>
          <p className="font-mono text-base font-bold uppercase tracking-widest text-hc-red">
            [03] the passport
          </p>
          <h2 className="mt-4 font-display text-5xl uppercase tracking-tight sm:text-6xl">
            One passport, every YSWS
          </h2>
          <p className="mt-6 max-w-md text-xl leading-relaxed text-muted">
            whoami gets you your first sticker. every ysws you finish earns
            another one, and you stick them in the passport yourself. so you
            remember them all. the design is still a draft, the community votes
            on the final.
          </p>

          <div className="mt-10 divide-y divide-line border-y border-line">
            {passportSteps.map((s) => (
              <div key={s.num} className="flex items-center gap-5 py-4">
                <span className="font-display text-2xl leading-none text-hc-red">
                  {s.num}
                </span>
                <p className="font-mono text-base uppercase tracking-wide text-ink/80">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 font-mono text-base uppercase tracking-widest text-faint">
            the stickers are real, you actually stick them in
          </p>
        </div>

        <div className="relative">
          <PassportMock className="rotate-2 transition-transform duration-300 hover:rotate-0" />
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
    q: "Why should I do this?",
    a: "because when it's over you've got something real to keep. a card with your name on it, a passport that fills up with every ysws you finish. it's a memory you can hold, of all the things you built with the club.",
  },
  {
    q: "Is the card design final?",
    a: "no. the card and passport you see are still a draft. we'll put the final design to a community vote once the ysws is going.",
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
      className="relative overflow-hidden border-t border-line bg-surface px-6 py-28 text-ink sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px)] bg-[size:3rem_3rem]"
      />
      <div className="relative mx-auto w-full max-w-3xl">
        <p className="font-mono text-base font-bold uppercase tracking-widest text-hc-red">
          [04] faq
        </p>
        <h2 className="mt-4 font-display text-5xl uppercase tracking-tight sm:text-6xl">
          Questions? ok.
        </h2>

        <div className="mt-14 divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-2xl uppercase tracking-tight text-ink transition-colors group-open:text-hc-red">
                  {f.q}
                </span>
                <span className="shrink-0 text-hc-red transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="grid transition-[grid-template-rows] duration-300 ease-out [grid-template-rows:0fr] group-open:[grid-template-rows:1fr]">
                <div className="overflow-hidden">
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
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
    <footer className="border-t border-line bg-surface px-6 py-12 text-ink">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Logo />
        <p className="font-mono text-base uppercase tracking-wide text-faint">
          made with <span className="text-hc-red">♥</span> by hackers
        </p>
        <a
          href="https://hackclub.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-base font-bold uppercase tracking-wide text-hc-red transition-colors hover:text-ink"
        >
          hackclub.com →
        </a>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-ink selection:bg-hc-red selection:text-white">
      <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
        <defs>
          <filter id="stamp-rough">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
          </filter>
        </defs>
      </svg>
      <Nav />
      <main>
        <Reveal>
          <Hero />
        </Reveal>
        <HowItWorks />
        <Reveal>
          <PassportSection />
        </Reveal>
        <Reveal>
          <FAQ />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
