// src/components/providers/AppProviders.tsx

"use client";

import type { ReactNode } from "react";
import { WagmiProvider } from "./WagmiProvider";
import { OnchainProviders } from "./OnchainProviders";
import { ThemeProvider } from "./ThemeProvider";
import { FrameProvider } from "./FrameProvider";
import { FrameAutoConnect } from "./FrameConnector";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider>
      <OnchainProviders>
        <ThemeProvider>
          <FrameProvider>
            <FrameAutoConnect />
            {children}
          </FrameProvider>
        </ThemeProvider>
      </OnchainProviders>
    </WagmiProvider>
  );
}