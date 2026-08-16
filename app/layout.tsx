import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import NotificationCard from "./NotificationCard";

const zarathustra = localFont({
  variable: "--font-display",
  src: "./fonts/zarathustra.otf",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const hankenItalic = Hanken_Grotesk({
  variable: "--font-sans-italic",
  subsets: ["latin"],
  style: "italic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "whoami · Ship 5 hours, get your ID",
  description:
    "A Hack Club YSWS. Build identity-related software for 5 hours and earn a real Hack Club ID card.",
  openGraph: {
    title: "whoami · Ship 5 hours, get your ID",
    description:
      "A Hack Club YSWS. Build identity-related software for 5 hours and earn a real Hack Club ID card.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1a1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${zarathustra.variable} ${hanken.variable} ${hankenItalic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-paper">
        {children}
        <NotificationCard />
      </body>
    </html>
  );
}