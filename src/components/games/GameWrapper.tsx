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
import { motion } from "framer-motion";
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

  const hasTokens = (balance?.accessTokensOffchain || 0) >= 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Game header */}
      {!isPlaying && (
        <div className="fixed top-0 left-0 right-0 z-40 glass-nav px-4 py-3">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <button
              onClick={() => router.push("/games")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              <span className="font-bold text-sm">{config.name}</span>
            </div>
            <div className="glass flex items-center gap-1 px-2 py-1 rounded-full">
              <Coins className="h-3 w-3 text-amber-400" />
              <span className="text-xs font-bold">
                {balance?.accessTokensOffchain || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pre-game screen */}
      {!isPlaying && (
        <div className="pt-20 pb-8 px-4 max-w-md mx-auto">
          <motion.div
            className="flex flex-col items-center gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Game icon */}
            <div
              className={`h-24 w-24 rounded-3xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-5xl shadow-2xl`}
            >
              {config.icon}
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold mb-1">{config.name}</h1>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="glass-card text-center py-3">
                <p className="text-xs text-muted-foreground">Max Points</p>
                <p className="font-bold text-sm">{config.basePoints}</p>
              </div>
              <div className="glass-card text-center py-3">
                <p className="text-xs text-muted-foreground">Chest At</p>
                <p className="font-bold text-sm">
                  {config.chestThreshold * 100}%
                </p>
              </div>
              <div className="glass-card text-center py-3">
                <p className="text-xs text-muted-foreground">Max Time</p>
                <p className="font-bold text-sm">
                  {Math.floor(config.maxDuration / 60)}m
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="glass-card p-3 border-red-500/30 w-full">
                <p className="text-xs text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Start button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleStart}
              disabled={!hasTokens}
              loading={starting || loading}
            >
              {hasTokens ? (
                <>
                  <Play className="h-5 w-5" />
                  Start Game (1 Token)
                </>
              ) : (
                "No Tokens — Check In or Buy"
              )}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Active game */}
      {isPlaying && (
        <div className="game-canvas-container w-full h-screen">
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