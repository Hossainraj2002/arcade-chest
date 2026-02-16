// src/components/home/CheckInCard.tsx

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUserStore } from "@/stores/useUserStore";
import { useUser } from "@/hooks/useUser";
import { ECONOMY } from "@/lib/constants";
import { motion } from "framer-motion";
import { Flame, Zap, Calendar } from "lucide-react";
import { useAccount } from "wagmi";

export function CheckInCard() {
  const streak = useUserStore((s) => s.streak);
  const { address } = useAccount();

  // IMPORTANT: do NOT auto-init here, AppShell already does it.
  const { checkin } = useUser(address, { autoInit: false });

  const [loading, setLoading] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const handleCheckin = async () => {
    setLoading(true);
    const success = await checkin();
    if (success) {
      setJustCheckedIn(true);
      setTimeout(() => setJustCheckedIn(false), 3000);
    }
    setLoading(false);
  };

  if (!streak) return null;

  const bonusTokens = Math.floor(
    (ECONOMY.DAILY_CHECKIN_TOKENS * streak.streakBonusPercent) / 100
  );
  const totalTokens = ECONOMY.DAILY_CHECKIN_TOKENS + bonusTokens;

  return (
    <Card variant="glass" className="relative overflow-hidden">
      {/* Streak glow */}
      {streak.currentStreak >= 3 && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-amber-500/5 to-primary/5 animate-pulse" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm">Daily Check-In</h3>
          </div>
          {streak.currentStreak > 0 && (
            <Badge variant="warning" size="md">
              <Flame className="h-3 w-3 mr-1" />
              {streak.currentStreak} day streak
            </Badge>
          )}
        </div>

        {/* Streak dots */}
        <div className="flex gap-1.5 mb-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i < streak.currentStreak
                  ? "bg-primary glow"
                  : i === streak.currentStreak && streak.canCheckinToday
                  ? "bg-primary/30 animate-pulse"
                  : "bg-secondary"
              }`}
            />
          ))}
        </div>

        {streak.streakBroken && (
          <div className="glass-card p-2 mb-3 border-amber-500/30">
            <p className="text-xs text-amber-400">
              ⚠️ Streak broken! Pay 1 USDC to restore, or start fresh.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span className="text-foreground font-bold">{totalTokens}</span>{" "}
            tokens
            {bonusTokens > 0 && (
              <span className="text-primary ml-1">
                (+{streak.streakBonusPercent}% bonus)
              </span>
            )}
          </div>

          {justCheckedIn ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-emerald-400 text-sm font-bold"
            >
              <Zap className="h-4 w-4" /> Claimed!
            </motion.div>
          ) : (
            <Button
              size="sm"
              variant={streak.canCheckinToday ? "primary" : "secondary"}
              onClick={handleCheckin}
              disabled={!streak.canCheckinToday}
              loading={loading}
            >
              {streak.canCheckinToday ? "Check In" : "Done Today"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
