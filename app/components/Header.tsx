import Link from "next/link";
import NavHoverCard from "./NavHoverCard";

const SLACK_CHANNEL = "https://app.slack.com/client/E09V59WQY1E/C0BM1L56D19";

export default function Header() {
  return (
    <header
      className="relative w-full bg-gradient-to-br from-hc-blue to-[#01bbff] rounded-t-2xl shadow-lg"
      style={{
        height: "120px",
        borderTopLeftRadius: "0.75rem",
        borderTopRightRadius: "0.75rem",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          overflow: "clip",
          borderTopLeftRadius: "0.75rem",
          borderTopRightRadius: "0.75rem",
        }}
<<<<<<< Updated upstream
      />

      <div className="relative mx-auto flex max-w-5xl items-center justify-end gap-3 px-5 text-white z-20">
        <NavHoverCard />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-5 pt-3 pb-1 text-white/80 text-xs sm:text-sm z-20">
        <img
          src="/passport.png"
          alt=""
          className="absolute object-contain pointer-events-none hidden xl:block -mt-20"
          style={{
            left: "-170px",
            top: "-3px",
            width: "240px",
            height: "auto",
            zIndex: 30,
            transform: "rotate(-15deg)",
          }}
        />
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
=======
      >
        <div
          className="absolute -inset-30"
          style={{
            backgroundImage: `conic-gradient(rgba(255, 255, 255, 0.12) 0 25%, rgba(255, 255, 255, 0.28) 25% 50%, rgba(255, 255, 255, 0.12) 50% 75%, rgba(255, 255, 255, 0.28) 75% 100%)`,
            backgroundSize: "152px 152px",
            transform: "rotate(14.59deg)",
            backgroundPosition: "center",
          }}
        />
      </div>

      <div className="relative z-30">
        {/* Navbar */}
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-5 py-2 text-white">
          <div className="flex items-center gap-1">
            {canUseDashboard && (
              <Link
                href="/dashboard"
                className="rounded-full px-2.5 py-1.5 text-sm font-semibold no-underline text-white transition-colors hover:bg-white/25 sm:px-3"
              >
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-full px-2.5 py-1.5 text-sm font-semibold no-underline text-white transition-colors hover:bg-white/25 sm:px-3"
              >
                Admin
              </Link>
            )}

            <NavHoverCard />
          </div>
        </div>

        {/* Beta banner */}
        <div className="relative mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-5 pt-2 pb-1 text-white/80 text-xs sm:text-sm">
          <PassportImage />

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
>>>>>>> Stashed changes
      </div>
    </header>
  );
}
