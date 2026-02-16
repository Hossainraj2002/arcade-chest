// src/hooks/useGameSession.ts

import { useState, useCallback } from "react";
import type { GameId } from "@/lib/constants";
import type {
  RoundStartResponse,
  RoundEndRequest,
  RoundEndResponse,
} from "@/types";
import { useUserStore } from "@/stores/useUserStore";
import { useGameStore } from "@/stores/useGameStore";

export function useGameSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile, decrementToken, addPoints, addChest } = useUserStore();
  const { startRound, endRound } = useGameStore();

  const startGame = useCallback(
    async (gameId: GameId): Promise<RoundStartResponse | null> => {
      if (!profile?.wallet) {
        setError("Not connected");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/round/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: profile.wallet, gameId }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to start round");
          return null;
        }

        decrementToken();
        startRound(data.roundId, data.nonce, gameId);

        return data as RoundStartResponse;
      } catch (err) {
        setError("Network error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [profile, decrementToken, startRound]
  );

  const endGame = useCallback(
    async (
      roundId: string,
      runSummary: RoundEndRequest["runSummary"]
    ): Promise<RoundEndResponse | null> => {
      if (!profile?.wallet) {
        setError("Not connected");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/round/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: profile.wallet,
            roundId,
            runSummary,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to end round");
          return null;
        }

        if (data.success) {
          addPoints(data.pointsAwarded);
          if (data.chestGranted) {
            addChest("free");
          }
          endRound({
            validatedScore: data.validatedScore,
            pointsAwarded: data.pointsAwarded,
            chestGranted: data.chestGranted,
          });
        }

        return data as RoundEndResponse;
      } catch (err) {
        setError("Network error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [profile, addPoints, addChest, endRound]
  );

  return { startGame, endGame, loading, error };
}