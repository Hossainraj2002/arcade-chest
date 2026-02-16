// src/components/games/GameWrapper.tsx

"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useGameSession } from "@/hooks/useGameSession";
import { useGameStore } from "@/stores/useGameStore";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/Button";
import { PostGameModal } from "@/components/shared/PostGameModal";
import { GAME_CONFIG, type GameId } from "@/lib/constants";
import { ArrowLeft, Coins, Play } from "lucide-react";
import type { RoundEndRequest } from "@/types";

interface GameWrapperProps {
  gameId: GameId;
  children: (props: {
    onGameEnd: (summary: RoundEndRequest["runSummary"]) => void;
    isPlaying: boolean;
    isPaused: boolean;
    nonce: string | null;
  }) => ReactNode;
}

export function GameWrapper({ gameId, children }: GameWrapperProps) {
  const router = useRouter();
  const { startGame, endGame, loading, error } = useGameSession();
  const { isPlaying, isPaused, roundId, nonce } = useGameStore();
  const balance = useUserStore((s) => s.balance);
  const config = GAME_CONFIG[gameId];
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    await startGame(gameId);
    setStarting(false);
  };

  const handleGameEnd = useCallback(
    async (summary: RoundEndRequest["runSummary"]) => {
      if (!roundId) return;
      await endGame(roundId, summary);
    },
    [roundId, endGame]
  );

  const hasTokens = (balance?.accessTokensOffchain ?? 0) >= 1;

  return (
    <div className="py-3">
      {/* Pre-game screen */}
      {!isPlaying && (
        <div className="space-y-5">
          {/* Back link */}
          <button
            onClick={() => router.push("/games")}
            className="flex items-center gap-1 text-sm transition-colors"
            style={{ color: "var(--muted-fg)" }}
          >
            <ArrowLeft size={16} /> Back to Games
          </button>

          {/* Game hero */}
          <div className="flex flex-col items-center gap-4">
            <div
              className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-4xl shadow-xl`}
            >
              {config.icon}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{config.name}</h1>
              <p className="text-sm" style={{ color: "var(--muted-fg)" }}>
                {config.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Max pts", value: config.basePoints },
              { label: "Chest @", value: `${config.chestThreshold * 100}%` },
              { label: "Max time", value: `${Math.floor(config.maxDuration / 60)}m` },
            ].map((s) => (
              <div key={s.label} className="glass-card text-center py-3">
                <p className="text-xs" style={{ color: "var(--muted-fg)" }}>{s.label}</p>
                <p className="font-bold text-sm">{s.value}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="glass-card p-3" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={!hasTokens}
            loading={starting || loading}
          >
            {hasTokens ? (
              <>
                <Play size={18} /> Start Game · 1 Token
              </>
            ) : (
              "No tokens — check in or buy"
            )}
          </Button>
        </div>
      )}

      {/* Active game — renders inside the shell so nav stays visible */}
      {isPlaying && (
        <div className="game-canvas-container -mx-4" style={{ minHeight: "60dvh" }}>
          {children({
            onGameEnd: handleGameEnd,
            isPlaying,
            isPaused,
            nonce,
          })}
        </div>
      )}

      <PostGameModal />
    </div>
  );
}