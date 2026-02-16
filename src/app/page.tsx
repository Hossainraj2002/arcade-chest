// src/app/page.tsx

"use client";

import { CheckInCard } from "@/components/home/CheckInCard";
import { TokenShop } from "@/components/home/TokenShop";
import { PostGameModal } from "@/components/shared/PostGameModal";
import { useUserStore } from "@/stores/useUserStore";
import { formatNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Gamepad2, Gift, Trophy, Users, ChevronRight, Flame } from "lucide-react";

export default function HomePage() {
  const balance = useUserStore((s) => s.balance);
  const streak = useUserStore((s) => s.streak);
  const profile = useUserStore((s) => s.profile);
  const router = useRouter();

  return (
    <>
      <div className="space-y-4 py-3">
        {/* ── Hero ── */}
        <section className="glass-card p-5 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, var(--primary) 0%, transparent 60%)",
            }}
          />
          <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-fg)" }}>
            🏆 Season 1 — Live
          </p>
          <h2 className="text-xl font-extrabold gradient-text leading-tight">
            Play. Earn. Open Chests.
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--muted-fg)" }}>
            Climb the leaderboard and share the reward pool.
          </p>

          {/* Quick stats row */}
          {balance && (
            <div className="flex justify-center gap-4 mt-4 text-center">
              <div>
                <p className="text-lg font-bold tabular-nums">{formatNumber(balance.pointsSeason)}</p>
                <p className="text-[10px]" style={{ color: "var(--muted-fg)" }}>Points</p>
              </div>
              <div className="w-px" style={{ background: "var(--border-color)" }} />
              <div>
                <p className="text-lg font-bold tabular-nums">{balance.accessTokensOffchain}</p>
                <p className="text-[10px]" style={{ color: "var(--muted-fg)" }}>Tokens</p>
              </div>
              <div className="w-px" style={{ background: "var(--border-color)" }} />
              <div>
                <p className="text-lg font-bold tabular-nums">{streak?.currentStreak || 0}</p>
                <p className="text-[10px]" style={{ color: "var(--muted-fg)" }}>Streak</p>
              </div>
            </div>
          )}
        </section>

        {/* ── Check-in + Tokens ── */}
        <CheckInCard />
        <TokenShop />

        {/* ── Quick links grid ── */}
        <section className="grid grid-cols-2 gap-3">
          <QuickLink
            icon={<Gamepad2 size={20} />}
            label="Play Now"
            sub="5 games"
            color="var(--primary)"
            onClick={() => router.push("/games")}
          />
          <QuickLink
            icon={<Gift size={20} />}
            label="Chests"
            sub={balance && balance.chestFreePending > 0 ? `${balance.chestFreePending} ready` : "Earn by playing"}
            color="#f59e0b"
            onClick={() => router.push("/profile")}
          />
          <QuickLink
            icon={<Trophy size={20} />}
            label="Leaderboard"
            sub="Season ranks"
            color="#06b6d4"
            onClick={() => router.push("/leaderboard")}
          />
          <QuickLink
            icon={<Users size={20} />}
            label="Invite Friends"
            sub="Earn 20 %"
            color="#10b981"
            onClick={() => router.push("/profile")}
          />
        </section>

        {/* ── Streak CTA (if broken) ── */}
        {streak?.streakBroken && (
          <div className="glass-card p-4 flex items-center gap-3" style={{ borderColor: "rgba(245,158,11,0.3)" }}>
            <Flame size={24} className="text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Streak broken!</p>
              <p className="text-xs" style={{ color: "var(--muted-fg)" }}>
                Pay 1 USDC to restore your {streak.longestStreak}-day streak, or start fresh.
              </p>
            </div>
          </div>
        )}
      </div>

      <PostGameModal />
    </>
  );
}

/* ─── helper ─── */
function QuickLink({
  icon,
  label,
  sub,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-3.5 flex items-center gap-3 text-left active:scale-[0.97] transition-transform"
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{label}</p>
        <p className="text-[11px] truncate" style={{ color: "var(--muted-fg)" }}>{sub}</p>
      </div>
      <ChevronRight size={16} style={{ color: "var(--muted-fg)" }} />
    </button>
  );
}