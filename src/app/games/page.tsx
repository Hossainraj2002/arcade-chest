// src/app/games/page.tsx

"use client";

import { GameCard } from "@/components/games/GameCard";
import { GAME_IDS } from "@/lib/constants";
import { PostGameModal } from "@/components/shared/PostGameModal";
import { useUserStore } from "@/stores/useUserStore";
import { Coins } from "lucide-react";

export default function GamesPage() {
  const balance = useUserStore((s) => s.balance);

  return (
    <>
      <div className="space-y-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Games</h1>
            <p className="text-xs" style={{ color: "var(--muted-fg)" }}>
              1 token per round · earn points &amp; chests
            </p>
          </div>
          <div className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-full">
            <Coins size={14} className="text-amber-400" />
            <span className="text-sm font-bold tabular-nums">
              {balance?.accessTokensOffchain ?? 0}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {GAME_IDS.map((id, i) => (
            <GameCard key={id} gameId={id} index={i} />
          ))}
        </div>
      </div>
      <PostGameModal />
    </>
  );
}