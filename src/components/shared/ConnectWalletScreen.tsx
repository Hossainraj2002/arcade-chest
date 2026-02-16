// src/components/shared/ConnectWalletScreen.tsx

"use client";

import { useConnect, useAccount } from "wagmi";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useFrame } from "@/components/providers/FrameProvider";

export function ConnectWalletScreen() {
  const { connectors, connect, isPending } = useConnect();
  const { isConnecting } = useAccount();
  const { isInFrame } = useFrame();

  const handleConnect = () => {
    // In frame context, use farcasterFrame connector
    // Outside frame, use coinbaseWallet connector
    if (isInFrame) {
      const frameConnector = connectors.find(
        (c) => c.id === "farcasterFrame"
      );
      if (frameConnector) {
        connect({ connector: frameConnector });
        return;
      }
    }

    // Fallback: use coinbaseWallet
    const cbConnector = connectors.find(
      (c) => c.id === "coinbaseWalletSDK"
    );
    if (cbConnector) {
      connect({ connector: cbConnector });
      return;
    }

    // Last resort: first available connector
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <motion.div
        className="flex flex-col items-center gap-8 max-w-sm w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="text-7xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          🎮
        </motion.div>

        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            ARCADE CHEST
          </h1>
          <p className="text-muted-foreground text-sm">
            Play games. Earn points. Open chests. Win rewards.
          </p>
        </div>

        {/* Game icons */}
        <div className="flex gap-3">
          {["🧱", "💎", "🏓", "🫧", "🦆"].map((emoji, i) => (
            <motion.div
              key={i}
              className="glass-card h-12 w-12 flex items-center justify-center text-xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <div className="w-full space-y-2">
          {[
            "🎯 5 free plays daily",
            "🏆 Global leaderboard",
            "🎁 NFT & USDC rewards",
            "👥 Referral bonuses",
            "⛽ Free gas on Base",
          ].map((text, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {text}
            </motion.div>
          ))}
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleConnect}
          loading={isPending || isConnecting}
        >
          {isInFrame ? "Continue" : "Connect Wallet"}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Powered by Base • Smart Wallet • Free Gas
        </p>
      </motion.div>
    </div>
  );
}