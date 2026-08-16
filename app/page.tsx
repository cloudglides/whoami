import Reveal from "./Reveal";
import Scramble from "./Scramble";

const SLACK_URL = "https://app.slack.com/client/E09V59WQY1E/C0BM1L56D19";

const steps = [
  {
    no: "01",
    tag: "say hi",
    title: "Join the Slack",
    href: SLACK_URL,
    cta: "say hi",
    note: "channel #whoami",
    body: "find #whoami in the hack club slack and say hi. the rules fit on one page and they're mostly common sense.",
  },
  {
    no: "02",
    tag: "build · track it",
    title: "Build for 5 hours",
    note: "tracked in hackatime",
    body: "identity-related software. a login system, an auth tool, a name generator, or something that only makes sense to you. track 5 real hours in hackatime, or a notes app if you'd rather. we're not picky.",
  },
  {
    no: "03",
    tag: "exit · shipped",
    title: "Ship it, get your ID",
    note: "status · mailed",
    body: "ship your project. your card goes in the mail. that part we're sure about.",
  },
];

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
    a: "no. five hours of making something (anything) is the only real requirement. code it however fits you.",
  },
  {
    q: "Why should I do this?",
    a: "because when it's over you've got something real to keep. a card with your name on it, a passport that fills up with every ysws you finish. you can hold it, and it's proof the hours actually happened.",
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

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink text-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-paper focus:px-4 focus:py-2 focus:text-base focus:font-semibold focus:text-ink"
      >
        skip to content
      </a>

      {/* grain */}
      <div className="grain-overlay" aria-hidden />

      <div className="mx-auto max-w-[68rem] px-[clamp(1rem,4vw,2rem)]">
        <main id="main" className="scroll-mt-14">
        {/* HERO */}
        <section id="top" className="pt-[clamp(3rem,7vh,4.5rem)] text-center">
          <Reveal>
            <p className="font-body text-sm uppercase tracking-[0.2em] text-paper-dim">
              <Scramble text="a hack club · ysws" />
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.9]">
              <Scramble text="ship 5 hours." />
              <br />
              <span className="text-lavender">
                <Scramble text="get the ID." />
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-8 max-w-md font-body text-[clamp(1.05rem,2vw,1.3rem)] leading-relaxed text-paper-dim">
              <Scramble text="build identity-related software for 5 hours and get a real hack club ID in the mail. that's it." />
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              <a
                href={SLACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-[clamp(1.6rem,3.4vw,2.2rem)] text-lavender no-underline transition-colors hover:text-lavender-dim"
              >
                [ start shipping ]
              </a>
              <a
                href="#how"
                className="font-body text-[clamp(1.05rem,2vw,1.2rem)] text-paper transition-colors hover:text-lavender"
              >
                or see how it works ↓
              </a>
</div>
              </Reveal>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="mt-[clamp(3.5rem,9vw,6.5rem)]">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95]">
                <Scramble text="how it works" />
                <span className="text-lavender">.</span>
              </h2>
              <p className="mb-2 max-w-xs font-body text-[clamp(0.95rem,1.5vw,1.05rem)] text-paper-dim">
                <Scramble text="we don't do applications. if you're between 13 and 19 and you're in the slack, consider yourself in." />
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.no} delay={i * 0.06}>
                <div className="border-t border-paper/25 pt-5">
                  <p className="font-display text-4xl leading-none text-lavender">
                    <Scramble text={s.no} />
                  </p>
                  <h3 className="mt-4 font-serif text-[clamp(1.4rem,2.2vw,1.7rem)] leading-tight text-paper">
                    <Scramble text={s.title} />
                  </h3>
                  <p className="mt-3 font-body text-[0.95rem] leading-relaxed text-paper-dim">
                    <Scramble text={s.body} />
                  </p>
                  {s.href ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block font-serif text-[clamp(1.2rem,2vw,1.4rem)] text-lavender no-underline transition-colors hover:text-lavender-dim"
                    >
                      [ {s.cta} ]
                    </a>
                  ) : (
                    <p className="mt-4 font-body text-sm italic text-paper-dim/80">
                      <Scramble text={s.note} />
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-[clamp(3.5rem,9vw,6.5rem)]">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95]">
              <Scramble text="faq" />
              <span className="text-lavender">.</span>
            </h2>
          </Reveal>
          <div className="mt-4 max-w-2xl">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.02}>
                <details className="group border-t border-paper/25 py-5 last:border-b">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                    <span className="font-serif text-[clamp(1.3rem,2.2vw,1.6rem)] leading-tight text-paper transition-colors group-open:text-lavender">
                      <Scramble text={f.q} />
                    </span>
                    <span
                      aria-hidden
                      className="shrink-0 font-serif text-2xl text-lavender transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="grid transition-[grid-template-rows] duration-300 ease-out [grid-template-rows:0fr] group-open:[grid-template-rows:1fr]">
                    <div className="overflow-hidden">
                      <p className="max-w-xl pt-2 font-body text-[0.95rem] leading-relaxed text-paper-dim">
                        <Scramble text={f.a} />
                      </p>
                    </div>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-[clamp(3.5rem,9vw,6.5rem)] pb-[clamp(1rem,3vw,2rem)] text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.9]">
              <Scramble text="your ID is" />{" "}
              <span className="text-lavender">
                <Scramble text="waiting." />
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <a
              href={SLACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block font-serif text-[clamp(1.7rem,4vw,2.4rem)] text-lavender no-underline transition-colors hover:text-lavender-dim"
            >
              [ join the slack ]
            </a>
          </Reveal>
        </section>

        </main>

        {/* FOOTER */}
        <footer className="flex flex-col items-center justify-between gap-3 border-t border-paper/25 py-6 font-body text-sm text-paper-dim sm:flex-row">
          <span className="font-display text-lg leading-none text-lavender">
            whoami
          </span>
          <span>
            <Scramble text="ship 5 hours, get the ID." />
          </span>
          <a
            href="https://hackclub.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-lavender"
          >
            hackclub.com
          </a>
        </footer>
      </div>
    </div>
  );
}
