// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@coinbase/onchainkit/styles.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Arcade Chest",
  description: "Five games. One leaderboard. Real rewards on Base.",
  openGraph: {
    title: "Arcade Chest",
    description: "Five games. One leaderboard. Real rewards on Base.",
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://basedgame.vercel.app/og-image.png",
    "fc:frame:button:1": "Play Now",
    "fc:frame:button:1:action": "launch_frame",
    "fc:frame:button:1:target": "https://basedgame.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#13121d" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#faf9f7" media="(prefers-color-scheme: light)" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}