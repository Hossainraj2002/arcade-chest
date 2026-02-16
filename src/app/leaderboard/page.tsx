"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useUserStore } from "@/stores/useUserStore";
import { formatNumber, shortenAddress } from "@/lib/utils";
import { Trophy, Crown, Medal } from "lucide-react";
import type { LeaderboardEntry, LeaderboardResponse } from "@/types";

export default function LeaderboardPage() {
  const profile = useUserStore((s) => s.profile);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"season" | "alltime">("season");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?type=${tab}&wallet=${profile?.wallet || ""}&limit=100`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, profile?.wallet]);

  const rankIcon = (r: number) => {
    if (r === 1) return <Crown size={18} className="text-amber-400" />;
    if (r === 2) return <Medal size={18} className="text-gray-300" />;
    if (r === 3) return <Medal size={18} className="text-amber-600" />;
    return <span className="text-xs font-bold w-5 text-center" style={{ color: "var(--muted-fg)" }}>{r}</span>;
  };

  return (
    <div className="space-y-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Leaderboard</h1>
          <p className="text-xs" style={{ color: "var(--muted-fg)" }}>{data?.total ?? 0} players</p>
        </div>
        <Trophy size={22} className="text-amber-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["season", "alltime"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 text-sm font-semibold rounded-xl transition-all"
            style={{
              background: tab === t ? "var(--primary)" : "var(--glass-bg)",
              color: tab === t ? "var(--primary-fg)" : "var(--muted-fg)",
            }}
          >
            {t === "season" ? "Season" : "All Time"}
          </button>
        ))}
      </div>

      {/* My rank */}
      {data?.myRank && (
        <Card variant="glow" className="p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
              <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>#{data.myRank}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Your Rank</p>
              <p className="text-xs" style={{ color: "var(--muted-fg)" }}>{formatNumber(data.myPoints ?? 0)} pts</p>
            </div>
          </div>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card h-16 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.entries.map((e) => (
            <Card
              key={e.wallet}
              variant="glass"
              className={`py-3 ${e.wallet === profile?.wallet ? "ring-1" : ""}`}
              style={e.wallet === profile?.wallet ? { borderColor: "rgba(139,92,246,0.4)" } : {}}
            >
              <div className="flex items-center gap-3">
                {rankIcon(e.rank)}
                <Avatar src={e.pfpUrl} alt={e.displayName || e.wallet} size="sm" />
                <p className="flex-1 text-sm font-semibold truncate">
                  {e.displayName || shortenAddress(e.wallet)}
                </p>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums">{formatNumber(e.points)}</p>
                  <p className="text-[10px]" style={{ color: "var(--muted-fg)" }}>pts</p>
                </div>
              </div>
            </Card>
          ))}
          {(!data?.entries || data.entries.length === 0) && (
            <div className="text-center py-12">
              <Trophy size={40} style={{ color: "var(--muted-fg)", opacity: 0.3 }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: "var(--muted-fg)" }}>No scores yet. Be the first!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}