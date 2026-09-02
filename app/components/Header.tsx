import Image from "next/image";
import Link from "next/link";
import NavHoverCard from "./NavHoverCard";

const SLACK_CHANNEL = "https://app.slack.com/client/E09V59WQY1E/C0BM1L56D19";

export default function Header() {
  return (
    <header className="relative z-10 py-4 overflow-x-clip">
      <div
        className="absolute inset-x-0 -top-3 bottom-0 bg-hc-blue header-stripes"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 text-white">
        <Link href="/" className="flex items-center no-underline">
          <Image
            src="/whoami-logo.png"
            alt="whoami"
            width={1849}
            height={634}
            priority
            className="h-9 w-auto sm:h-14"
          />
        </Link>

        <NavHoverCard />
      </div>

      {/* Beta banner — inside the same tilted strip */}
      <div className="relative mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-5 pt-3 pb-1 text-white/80 text-xs sm:text-sm">
        <span className="inline-block rounded-md bg-white/25 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
          beta
        </span>
        <span>
          This is a new service, your{" "}
          <a
            href={SLACK_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-white"
          >
            feedback
          </a>{" "}
          will help us improve it.
        </span>
      </div>
    </header>
  );
}
