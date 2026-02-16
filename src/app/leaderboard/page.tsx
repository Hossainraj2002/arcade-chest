// src/app/leaderboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useUserStore } from "@/stores/useUserStore";
import { formatNumber, shortenAddress } from "@/lib/utils";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";
import type { LeaderboardResponse } from "@/types";

export default function LeaderboardPage() {
  const profile = useUserStore((s) => s.profile);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"season" | "alltime">("season");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/leaderboard?type=${tab}&wallet=${profile?.wallet || ""}&limit=100`
        );
        const json = await res.json();
        setData(json);
      } catch {
        console.error("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tab, profile?.wallet]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5" style={{ color: "#FBBF24" }} />;
    if (rank === 2) return <Medal className="h-5 w-5" style={{ color: "#D1D5DB" }} />;
    if (rank === 3) return <Medal className="h-5 w-5" style={{ color: "#D97706" }} />;
    return (
      <span className="text-xs font-bold w-5 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
        {rank}
      </span>
    );
  };

  return (
    <motion.div
      className="space-y-4 py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Leaderboard</h1>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {data?.total || 0} players
          </p>
        </div>
        <Trophy className="h-6 w-6" style={{ color: "#FBBF24" }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("season")}
          className="flex-1 py-2 text-sm font-semibold rounded-xl transition-all"
          style={{
            backgroundColor: tab === "season" ? "hsl(var(--primary))" : "var(--glass-bg)",
            color: tab === "season" ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
          }}
        >
          Season
        </button>
        <button
          onClick={() => setTab("alltime")}
          className="flex-1 py-2 text-sm font-semibold rounded-xl transition-all"
          style={{
            backgroundColor: tab === "alltime" ? "hsl(var(--primary))" : "var(--glass-bg)",
            color: tab === "alltime" ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
          }}
        >
          All Time
        </button>
      </div>

      {/* My rank */}
      {data?.myRank && (
        <Card variant="glow">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "hsla(var(--primary), 0.2)" }}
            >
              <span className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>
                #{data.myRank}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Your Rank</p>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {formatNumber(data.myPoints || 0)} points
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Entries */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="glass-card p-4 animate-pulse h-16 rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.entries.map((entry, i) => (
            <motion.div
              key={entry.wallet}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                variant="glass"
                className={`py-3 ${
                  entry.wallet === profile?.wallet ? "ring-1" : ""
                }`}
                style={
                  entry.wallet === profile?.wallet
                    ? { borderColor: "hsla(var(--primary), 0.4)" }
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(entry.rank)}
                  <Avatar
                    src={entry.pfpUrl}
                    alt={entry.displayName || entry.wallet}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {entry.displayName || shortenAddress(entry.wallet)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatNumber(entry.points)}
                    </p>
                    <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                      pts
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {data?.entries.length === 0 && (
            <div className="text-center py-12">
              <Trophy
                className="h-12 w-12 mx-auto mb-3"
                style={{ color: "hsla(var(--muted-foreground), 0.3)" }}
              />
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                No scores yet. Be the first!
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}