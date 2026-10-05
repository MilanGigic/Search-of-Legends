import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import Spotlight from "@/components/ui/spotlight";
import { Providers } from "./providers";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "SoL.gg",
  title: {
    default: "Search of Legends | LoL Stats & Champion Insights",
    template: "%s | SoL.gg",
  },
  description:
    "Search League of Legends players by Riot ID, explore live games and match history, and compare champion stats, win rates, matchups, and regional leaderboards.",
  keywords: [
    "League of Legends stats",
    "LoL player stats",
    "summoner search",
    "Riot ID lookup",
    "live game lookup",
    "match history",
    "champion win rates",
    "champion matchups",
    "League of Legends leaderboard",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SoL.gg",
    title: "Search of Legends | LoL Stats & Champion Insights",
    description:
      "Search League of Legends players by Riot ID, explore live games and match history, and compare champion stats, win rates, matchups, and regional leaderboards.",
  },
  twitter: {
    card: "summary",
    title: "Search of Legends | LoL Stats & Champion Insights",
    description:
      "Search League of Legends players by Riot ID, explore live games and match history, and compare champion stats, win rates, matchups, and regional leaderboards.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bebasNeue.variable} ${inter.variable} antialiased bg-[#0B0D1C]`}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="animated-grid" />
        </div>
        <Spotlight />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
