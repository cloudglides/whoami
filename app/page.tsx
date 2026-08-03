import Image from "next/image";
import Tilt from "./Tilt";

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
    a: "because when it's over you've got something real to keep. a card with your name on it, a passport that fills up with every ysws you finish. it's a memory you can hold, of all the things you built with the club.",
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
    <div className="min-h-screen bg-background text-foreground selection:bg-hc-red selection:text-white">
      <main>
        <section id="top" className="relative pt-20">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-10 px-6 xl:grid-cols-[200px_minmax(0,1fr)_200px]">
            <div aria-hidden className="hidden xl:block">
              <div className="sticky -top-4 space-y-6">
                {[
  { name: "backImg1", rot: -4 },
  { name: "backImg7", rot: 3 },
  { name: "backImg9", rot: -2 },
].map((s) => (
                  <div key={s.name} style={{ transform: `rotate(${s.rot}deg)` }}>
                    <div className="peep-mask">
                      <Image
                        src={`/assets/peeps/${s.name}.webp`}
                        alt=""
                        width={450}
                        height={450}
                        className="w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-2xl min-w-0 text-center sm:text-left">
              <h1 className="text-3xl font-medium tracking-tight sm:text-5xl">
            Ship 5 hours.
            <br />
            <span className="text-hc-red">Get your own Hack Club ID.</span>
          </h1>

          <p className="mt-6 max-w-xl leading-relaxed text-muted sm:mx-0 mx-auto">
            Build identity-related software for 5 hours, get a Hack Club ID in
            the mail. It&apos;s a little memory of the YSWS you were part of.
            That&apos;s it, that&apos;s the whole program.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <span className="inline-block cursor-not-allowed bg-hc-red px-5 py-3 font-mono text-sm font-bold text-white opacity-70">
              Start shipping
            </span>
            <a
              href="https://app.slack.com/client/E09V59WQY1E/C0BM1L56D19"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-line px-5 py-3 font-mono text-sm text-foreground transition-colors duration-200 hover:border-hc-red hover:bg-hc-red/5 hover:text-hc-red"
            >
              join the slack
            </a>
          </div>

          <Tilt className="mx-auto mt-14 max-w-2xl">
            <Image
              src="/assets/hc-id.png"
              alt="Hack Club ID card"
              width={666}
              height={375}
              priority
              className="h-auto w-full drop-shadow-xl"
            />
          </Tilt>
            </div>

            <div aria-hidden className="hidden xl:block">
              <div className="sticky -top-4 space-y-8">
                {[
                  { img: "backImg8", rot: 5 },
                  { img: "backImg2", rot: -3 },
                  { img: "backImg6", rot: 4 },
                ].map(({ img, rot }) => (
                  <div key={img} style={{ transform: `rotate(${rot}deg)` }}>
                    <div className="peep-mask">
                      <Image
                        src={`/assets/peeps/${img}.webp`}
                        alt=""
                        width={450}
                        height={450}
                        className="w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-t border-line py-10">
          <div className="mx-auto w-full max-w-2xl px-6">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-muted">
            How it works
          </h2>
          <ol className="mt-6 divide-y divide-line border-y border-line">
            {steps.map((s) => (
              <li key={s.num} className="py-4">
                <span className="font-mono text-xs font-bold tracking-widest text-hc-red">
                  {s.num}
                </span>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          </div>
        </section>

        <section id="faq" className="border-t border-line py-10">
          <div className="mx-auto w-full max-w-2xl px-6">
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-muted">
            FAQ
          </h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                  <span className="font-medium transition-colors duration-200 group-open:text-hc-red">
                    {f.q}
                  </span>
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center text-hc-red">
                    <span className="absolute h-0.5 w-3.5 bg-current transition-transform duration-200" />
                    <span className="absolute h-3.5 w-0.5 bg-current transition-transform duration-200 group-open:rotate-90 group-open:opacity-0" />
                  </span>
                </summary>
                <div className="grid transition-[grid-template-rows] duration-300 ease-out [grid-template-rows:0fr] group-open:[grid-template-rows:1fr]">
                  <div className="overflow-hidden">
                    <p className="pt-3 leading-relaxed text-muted">{f.a}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
          </div>
        </section>
      </main>

      <footer className="relative mt-32 border-t border-line">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-6 font-mono text-sm text-muted">
          <span>whoami</span>
          <a
            href="https://hackclub.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-hc-red"
          >
            hackclub.com
          </a>
        </div>
        <div className="absolute -top-[9.25rem] right-0 w-full max-w-md">
          <Image
            src="/assets/footer.webp"
            alt="hack club"
            width={2048}
            height={1680}
            className="w-full"
          />
        </div>
      </footer>
    </div>
  );
}
