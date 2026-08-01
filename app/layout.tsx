import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AmbientAudio from "./AmbientAudio";
import NotificationCard from "./NotificationCard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "whoami · Ship 5 hours, get your ID",
  description:
    "A Hack Club YSWS. Build identity-related software for 5 hours and earn a real Hack Club ID card. a souvenir of the ysws you were part of.",
  openGraph: {
    title: "whoami · Ship 5 hours, get your ID",
    description:
      "A Hack Club YSWS. Build identity-related software for 5 hours and earn a real Hack Club ID card. a souvenir of the ysws you were part of.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="whoami-theme-paint"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("whoami-theme");var l=t?t==="light":window.matchMedia("(prefers-color-scheme: light)").matches;if(l)document.documentElement.classList.add("light");}catch(e){}})();`,
          }}
        />
        {children}
        <AmbientAudio />
        <NotificationCard />
      </body>
    </html>
  );
}
