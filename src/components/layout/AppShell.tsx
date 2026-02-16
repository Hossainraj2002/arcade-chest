// src/components/layout/AppShell.tsx

"use client";

import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { ConnectWalletScreen } from "../shared/ConnectWalletScreen";
import { useAccount } from "wagmi";
import { useUser } from "@/hooks/useUser";
import { useUserStore } from "@/stores/useUserStore";

export function AppShell({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  useUser(address);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isLoading = useUserStore((s) => s.isLoading);

  return (
    <div className="relative min-h-[100dvh] flex flex-col">
      {/* Top bar — always visible */}
      <TopBar />

      {/* Main content area — scrollable, padded for top+bottom bars */}
      <main
        className="flex-1 overflow-y-auto px-4 pt-16"
        style={{
          paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="mx-auto w-full max-w-md">
          {!isConnected ? (
            <ConnectWalletScreen />
          ) : isLoading || !isAuthenticated ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin text-4xl">🎮</div>
                <p className="text-sm text-muted-foreground">Setting up your arcade…</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      {/* Bottom nav — ALWAYS visible, ALWAYS on top */}
      <BottomNav />
    </div>
  );
}