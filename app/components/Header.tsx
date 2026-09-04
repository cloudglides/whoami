import Link from "next/link";
import NavHoverCard from "./NavHoverCard";

const SLACK_CHANNEL = "https://app.slack.com/client/E09V59WQY1E/C0BM1L56D19";

export default function Header() {
  return (
    <header
      className="relative w-full py-5 bg-gradient-to-br from-hc-blue to-[#01bbff] rounded-t-2xl shadow-lg"
      style={{
        minHeight: "70px",
        borderTopLeftRadius: "0.75rem",
        borderTopRightRadius: "0.75rem",
      }}
    >
      {/* Decorative background layer - clipped to header bounds */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          overflow: "clip",
          borderTopLeftRadius: "0.75rem",
          borderTopRightRadius: "0.75rem",
        }}
      >
        <div
          className="absolute -inset-30"
          style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 46%, rgba(255,255,255,0.12) 46%, rgba(255,255,255,0.12) 54%, transparent 54%),
              linear-gradient(-45deg, transparent 46%, rgba(255,255,255,0.12) 46%, rgba(255,255,255,0.12) 54%, transparent 54%)
            `,
            backgroundSize: "60px 60px",
            transform: "rotate(14.59deg)",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* Interactive navbar layer - escapes header overflow */}
      <div className="relative z-30">
        {/* Navbar */}
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-5 py-2 text-white">
          <div className="flex items-center gap-1">
            <NavHoverCard />
          </div>
        </div>

        {/* Beta banner */}
        <div className="relative mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-5 pt-4 pb-3 text-white/80 text-xs sm:text-sm mt-2">
          <img
            src="/passport.png"
            alt=""
            className="absolute object-contain pointer-events-none hidden xl:block"
            style={{
              left: "-180px",
              top: "-80px",
              width: "240px",
              height: "auto",
              zIndex: 30,
              transform: "rotate(-15deg)",
            }}
          />
          <span className="hidden sm:inline">
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
          <div className="flex-1 sm:hidden flex justify-end">
            <span className="inline-block rounded-md bg-white/25 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
              beta
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
