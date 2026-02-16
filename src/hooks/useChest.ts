// src/hooks/useChest.ts

import { useState, useCallback } from "react";
import type { ChestOpenResponse } from "@/types";
import { useUserStore } from "@/stores/useUserStore";

export function useChest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReward, setLastReward] = useState<ChestOpenResponse["reward"] | null>(null);
  const { profile, removeChest, addPoints } = useUserStore();

  const openChest = useCallback(
    async (chestType: "free" | "premium"): Promise<ChestOpenResponse | null> => {
      if (!profile?.wallet) {
        setError("Not connected");
        return null;
      }

      setLoading(true);
      setError(null);
      setLastReward(null);

      try {
        const res = await fetch("/api/chest/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: profile.wallet,
            chestType,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to open chest");
          return null;
        }

        if (data.success) {
          removeChest("free");
          if (data.reward.type === "points") {
            addPoints(data.reward.amount);
          }
          setLastReward(data.reward);
        }

        return data as ChestOpenResponse;
      } catch (err) {
        setError("Network error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [profile, removeChest, addPoints]
  );

  return { openChest, loading, error, lastReward };
}