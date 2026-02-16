// src/components/providers/AppProviders.tsx

"use client";

import type { ReactNode } from "react";
import { WagmiProvider } from "./WagmiProvider";
import { OnchainProviders } from "./OnchainProviders";
import { ThemeProvider } from "./ThemeProvider";
import { FrameProvider } from "./FrameProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider>
      <OnchainProviders>
        <ThemeProvider>
          <FrameProvider>{children}</FrameProvider>
        </ThemeProvider>
      </OnchainProviders>
    </WagmiProvider>
  );
}