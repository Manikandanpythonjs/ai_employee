import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Instrument_Serif,
  IBM_Plex_Mono,
  Inter,
} from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/system/SmoothScroll";
import { Preloader } from "@/components/system/Preloader";
import { Cursor } from "@/components/system/Cursor";
import { SiteNav } from "@/components/system/SiteNav";
import { SiteFooter } from "@/components/system/SiteFooter";
import { ScrollProgress } from "@/components/system/ScrollProgress";
import { PageTransition } from "@/components/system/PageTransition";

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aiemployee.ai"),
  title: {
    default: "AI Employee — Your Next Employee Doesn't Need A Desk",
    template: "%s — AI Employee",
  },
  description:
    "AI employees that reason, delegate, execute, verify and recover across your digital workforce. An AI employee is not a chatbot — it is an intelligent digital worker.",
  keywords: [
    "AI Employee",
    "AI Agents",
    "Agent Orchestration",
    "Multi-Agent Systems",
    "Delegation",
    "Self-Healing Agents",
    "Human-in-the-Loop",
    "AI Workforce",
  ],
  openGraph: {
    title: "AI Employee — An AI Workforce, Not A Chatbot",
    description:
      "AI employees that perceive, reason, delegate, execute, verify, recover and collaborate.",
    type: "website",
    images: ["/media/images/ai_employee.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Employee — An AI Workforce, Not A Chatbot",
    description:
      "AI employees that perceive, reason, delegate, execute, verify, recover and collaborate.",
    images: ["/media/images/ai_employee.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f2eee7",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${mono.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper text-ink antialiased">
        <a
          href="#main"
          className="u-mono fixed left-4 top-4 z-[200] -translate-y-24 bg-ink px-4 py-2 text-paper transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Preloader />
        <Cursor />
        <ScrollProgress />
        <SiteNav />
        <PageTransition>{children}</PageTransition>
        <SiteFooter />
      </body>
    </html>
  );
}
