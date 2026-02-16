// src/components/layout/AppShell.tsx

"use client";

import { type ReactNode, useEffect, useState } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { ConnectWalletScreen } from "../shared/ConnectWalletScreen";
import { useAccount } from "wagmi";
import { useUser } from "@/hooks/useUser";
import { useUserStore } from "@/stores/useUserStore";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { isLoading } = useUser(isConnected ? address : undefined);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-4xl">🎮</div>
      </div>
    );
  }

  if (!isConnected) {
    return <ConnectWalletScreen />;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin text-4xl">🎮</div>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Loading your arcade...
          </p>
        </div>
      </div>
    );
  }

  // If user is on a game page, render without shell chrome
  const isInGame = pathname.startsWith("/games/") && pathname.split("/").length > 2;

  if (isInGame) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="pt-16 pb-24 px-4 max-w-md mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}