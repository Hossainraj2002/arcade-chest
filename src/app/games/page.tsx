// src/app/games/page.tsx

"use client";

import { GameCard } from "@/components/games/GameCard";
import { GAME_IDS } from "@/lib/constants";
import { PostGameModal } from "@/components/shared/PostGameModal";
import { motion } from "framer-motion";
import { useUserStore } from "@/stores/useUserStore";
import { Coins } from "lucide-react";

export default function GamesPage() {
  const balance = useUserStore((s) => s.balance);

  return (
    <>
      <motion.div
        className="space-y-4 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Games</h1>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              1 Access Token per play
            </p>
          </div>
          <div className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-full">
            <Coins className="h-4 w-4" style={{ color: "#FBBF24" }} />
            <span className="text-sm font-bold">
              {balance?.accessTokensOffchain || 0}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {GAME_IDS.map((gameId, index) => (
            <GameCard key={gameId} gameId={gameId} index={index} />
          ))}
        </div>
      </motion.div>

      <PostGameModal />
    </>
  );
}