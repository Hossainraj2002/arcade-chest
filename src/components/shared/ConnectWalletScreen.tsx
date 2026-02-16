// src/components/shared/ConnectWalletScreen.tsx

"use client";

import { useConnect, useAccount } from "wagmi";
import { Button } from "@/components/ui/Button";
import { useFrame } from "@/components/providers/FrameProvider";

export function ConnectWalletScreen() {
  const { connectors, connect, isPending } = useConnect();
  const { isConnecting } = useAccount();
  const { isInFrame } = useFrame();

  const handleConnect = () => {
    if (isInFrame) {
      const fc = connectors.find((c) => c.id === "farcasterFrame");
      if (fc) { connect({ connector: fc }); return; }
    }
    const cb = connectors.find((c) => c.id === "coinbaseWalletSDK");
    if (cb) { connect({ connector: cb }); return; }
    if (connectors[0]) connect({ connector: connectors[0] });
  };

  return (
    <div className="flex flex-col items-center gap-8 pt-16 pb-8">
      {/* Hero */}
      <div className="text-6xl animate-bounce" style={{ animationDuration: "2s" }}>
        🎮
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold gradient-text">
          Arcade Chest
        </h1>
        <p className="text-sm" style={{ color: "var(--muted-fg)" }}>
          Five games. One leaderboard. Real rewards.
        </p>
      </div>

      {/* Game row */}
      <div className="flex gap-2.5">
        {["🧱", "💎", "🏓", "🫧", "🦆"].map((e, i) => (
          <div
            key={i}
            className="glass-card h-11 w-11 flex items-center justify-center text-lg"
          >
            {e}
          </div>
        ))}
      </div>

      {/* Value props */}
      <ul className="w-full space-y-1.5 text-sm" style={{ color: "var(--muted-fg)" }}>
        {[
          "🎯 5 free plays every day",
          "🏆 Season leaderboard with prizes",
          "🎁 Open chests for NFTs & USDC",
          "👥 Earn 20 % from referrals",
          "⛽ Gas-free on Base",
        ].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      <Button
        size="lg"
        className="w-full"
        onClick={handleConnect}
        loading={isPending || isConnecting}
      >
        {isInFrame ? "Continue" : "Connect Wallet"}
      </Button>

      <p className="text-[10px]" style={{ color: "var(--muted-fg)" }}>
        Smart Wallet · Base Network · Sponsored gas
      </p>
    </div>
  );
}