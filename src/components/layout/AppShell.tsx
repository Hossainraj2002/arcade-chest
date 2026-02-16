// src/components/layout/AppShell.tsx

"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { ConnectWalletScreen } from "../shared/ConnectWalletScreen";

import { useUser } from "@/hooks/useUser";
import { useUserStore } from "@/stores/useUserStore";

export function AppShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  const { address, isConnected } = useAccount();

  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isLoading = useUserStore((s) => s.isLoading);

  // We call initUser manually to guarantee "once per wallet"
  const { initUser } = useUser(undefined, { autoInit: false });

  // Track which wallet we already initialized
  const lastInitWalletRef = useRef<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isConnected || !address) {
      lastInitWalletRef.current = null;
      return;
    }

    const w = address.toLowerCase();

    // Only initialize once per wallet (prevents /api/user spam)
    if (lastInitWalletRef.current === w) return;

    lastInitWalletRef.current = w;

    // referral code (optional) + fid handled inside /api/user already
    let ref: string | undefined;
    try {
      const params = new URLSearchParams(window.location.search);
      ref = params.get("ref") || undefined;
    } catch {}

    initUser(w, ref, undefined);
  }, [isConnected, address, initUser]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-4xl">🎮</div>
      </div>
    );
  }

  if (!isConnected) return <ConnectWalletScreen />;

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="pt-16 pb-24 px-4 max-w-md mx-auto">
        {!isAuthenticated ? (
          <div className="glass-card p-4">
            <p className="text-sm font-semibold">Preparing your arcade…</p>
            <p className="text-xs text-muted-foreground mt-1">
              This should finish quickly. If it doesn’t, reload once.
            </p>
          </div>
        ) : (
          children
        )}
      </main>

      <BottomNav />

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-card p-5 flex flex-col items-center gap-3">
            <div className="animate-spin text-4xl">🎮</div>
            <p className="text-sm font-semibold">Setting up your arcade…</p>
            <p className="text-xs text-muted-foreground">
              Syncing profile and balance
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
