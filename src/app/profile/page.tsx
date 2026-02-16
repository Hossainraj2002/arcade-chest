"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/stores/useUserStore";
import { formatNumber, shortenAddress } from "@/lib/utils";
import { ChestModal } from "@/components/chest/ChestModal";
import { Copy, Gift, Gamepad2, Star, Flame, Users, Check } from "lucide-react";

export default function ProfilePage() {
  const profile = useUserStore((s) => s.profile);
  const balance = useUserStore((s) => s.balance);
  const streak = useUserStore((s) => s.streak);
  const [pd, setPd] = useState<any>(null);
  const [showChest, setShowChest] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile?.wallet) return;
    fetch(`/api/profile?wallet=${profile.wallet}`)
      .then((r) => r.json())
      .then(setPd)
      .catch(() => {});
  }, [profile?.wallet]);

  const copyRef = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(`${window.location.origin}/?ref=${profile.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile || !balance) return null;

  return (
    <>
      <div className="space-y-4 py-3">
        {/* Header */}
        <Card variant="glass" className="text-center py-6 px-4">
          <Avatar src={profile.pfpUrl} alt={profile.displayName || profile.wallet} size="xl" className="mx-auto mb-3" />
          <h1 className="text-lg font-bold">{profile.displayName || shortenAddress(profile.wallet)}</h1>
          {profile.fid && <Badge variant="primary" size="md" className="mt-1">FID {profile.fid}</Badge>}
          <p className="text-xs mt-1" style={{ color: "var(--muted-fg)" }}>{shortenAddress(profile.wallet, 6)}</p>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Star size={18} className="text-amber-400" />, val: formatNumber(balance.pointsTotal), label: "Total Points" },
            { icon: <Gamepad2 size={18} className="text-cyan-400" />, val: pd?.stats?.totalGames ?? 0, label: "Games Played" },
            { icon: <Gift size={18} className="text-purple-400" />, val: pd?.stats?.totalChests ?? 0, label: "Chests Opened" },
            { icon: <Flame size={18} className="text-orange-400" />, val: streak?.currentStreak ?? 0, label: "Day Streak" },
          ].map((s) => (
            <Card key={s.label} variant="glass" className="text-center py-3">
              <div className="mx-auto mb-1">{s.icon}</div>
              <p className="text-lg font-bold tabular-nums">{s.val}</p>
              <p className="text-[10px]" style={{ color: "var(--muted-fg)" }}>{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Pending chests */}
        {balance.chestFreePending > 0 && (
          <Card variant="glow" className="p-4" style={{ borderColor: "rgba(245,158,11,0.3)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="text-sm font-bold">{balance.chestFreePending} chest{balance.chestFreePending > 1 ? "s" : ""} ready</p>
                  <p className="text-xs" style={{ color: "var(--muted-fg)" }}>Tap to open</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowChest(true)}>Open</Button>
            </div>
          </Card>
        )}

        {/* Referral */}
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} style={{ color: "var(--primary)" }} />
            <h3 className="font-bold text-sm">Invite Friends</h3>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--muted-fg)" }}>
            Earn 20 % of your friends' check-in tokens and points.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 glass px-3 py-2 rounded-xl text-xs font-mono truncate">
              {profile.referralCode}
            </div>
            <Button size="sm" variant="glass" onClick={copyRef}>
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </Button>
          </div>
          {(pd?.stats?.referralCount ?? 0) > 0 && (
            <div className="mt-3 flex items-center justify-between text-xs">
              <span style={{ color: "var(--muted-fg)" }}>{pd.stats.referralCount} referrals</span>
              <span className="font-bold" style={{ color: "var(--primary)" }}>+{formatNumber(pd.stats.referralEarnings)} earned</span>
            </div>
          )}
        </Card>

        {/* Recent games */}
        {pd?.recentGames?.length > 0 && (
          <Card variant="glass" className="p-4">
            <h3 className="font-bold text-sm mb-3">Recent Games</h3>
            <div className="space-y-2">
              {pd.recentGames.slice(0, 5).map((g: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <span className="capitalize">{g.gameId}</span>
                  <div className="flex items-center gap-3">
                    <span style={{ color: "var(--muted-fg)" }}>Score: {g.score}</span>
                    <Badge variant="primary">+{g.points}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <ChestModal isOpen={showChest} onClose={() => setShowChest(false)} />
    </>
  );
}