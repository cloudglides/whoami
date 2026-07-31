import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "whoami — Ship 5 hours, get your ID",
  description:
    "A Hack Club YSWS. Build identity-related software for 5 hours and earn a real, physical Hack Club ID card.",
  openGraph: {
    title: "whoami — Ship 5 hours, get your ID",
    description:
      "A Hack Club YSWS. Build identity-related software for 5 hours and earn a real Hack Club ID card.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
