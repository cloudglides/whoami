import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import home from "../content/home.json";

const zarathustra = localFont({
  variable: "--font-zarathustra",
  src: "./fonts/zarathustra.otf",
  display: "swap",
});

const inter = Inter({
  variable: "--font-gds",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: home.metaTitle,
  description: home.heroIntro,
  openGraph: {
    title: home.metaTitle,
    description: home.heroIntro,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${zarathustra.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-govuk-white text-govuk-text">
        <a
          href="#main-content"
          className="govuk-skip-link bg-govuk-black px-4 py-2 text-sm font-bold text-govuk-white no-underline focus:static focus:w-auto focus:h-auto focus:overflow-visible"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1 scroll-mt-14">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
