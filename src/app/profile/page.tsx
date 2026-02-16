// src/app/profile/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/stores/useUserStore";
import { formatNumber, shortenAddress } from "@/lib/utils";
import { ChestModal } from "@/components/chest/ChestModal";
import { motion } from "framer-motion";
import {
  Copy,
  Gift,
  Gamepad2,
  Star,
  Flame,
  Users,
  Check,
} from "lucide-react";

export default function ProfilePage() {
  const profile = useUserStore((s) => s.profile);
  const balance = useUserStore((s) => s.balance);
  const streak = useUserStore((s) => s.streak);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChest, setShowChest] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile?.wallet) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile?wallet=${profile.wallet}`);
        const data = await res.json();
        setProfileData(data);
      } catch {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profile?.wallet]);

  const copyReferralLink = () => {
    if (!profile?.referralCode) return;
    const link = `${window.location.origin}/?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile || !balance) return null;

  return (
    <>
      <motion.div
        className="space-y-4 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Profile header */}
        <Card variant="glass" className="text-center py-6">
          <Avatar
            src={profile.pfpUrl}
            alt={profile.displayName || profile.wallet}
            size="xl"
            className="mx-auto mb-3"
          />
          <h1 className="text-lg font-bold">
            {profile.displayName || shortenAddress(profile.wallet)}
          </h1>
          {profile.fid && (
            <Badge variant="primary" size="md" className="mt-1">
              FID: {profile.fid}
            </Badge>
          )}
          <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            {shortenAddress(profile.wallet, 6)}
          </p>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="glass" className="text-center py-3">
            <Star className="h-5 w-5 mx-auto mb-1" style={{ color: "#FBBF24" }} />
            <p className="text-lg font-bold">
              {formatNumber(balance.pointsTotal)}
            </p>
            <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Total Points</p>
          </Card>
          <Card variant="glass" className="text-center py-3">
            <Gamepad2 className="h-5 w-5 mx-auto mb-1" style={{ color: "#22D3EE" }} />
            <p className="text-lg font-bold">
              {profileData?.stats?.totalGames || 0}
            </p>
            <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Games Played</p>
          </Card>
          <Card variant="glass" className="text-center py-3">
            <Gift className="h-5 w-5 mx-auto mb-1" style={{ color: "#A855F7" }} />
            <p className="text-lg font-bold">
              {profileData?.stats?.totalChests || 0}
            </p>
            <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Chests Opened</p>
          </Card>
          <Card variant="glass" className="text-center py-3">
            <Flame className="h-5 w-5 mx-auto mb-1" style={{ color: "#F97316" }} />
            <p className="text-lg font-bold">
              {streak?.currentStreak || 0}
            </p>
            <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Day Streak</p>
          </Card>
        </div>

        {/* Pending chests */}
        {balance.chestFreePending > 0 && (
          <Card variant="glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="text-sm font-bold">
                    {balance.chestFreePending} Chest
                    {balance.chestFreePending > 1 ? "s" : ""} Waiting
                  </p>
                  <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Tap to open and claim rewards
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowChest(true)}>
                Open
              </Button>
            </div>
          </Card>
        )}

        {/* Referral */}
        <Card variant="glass">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5" style={{ color: "hsl(var(--primary))" }} />
            <h3 className="font-bold text-sm">Referral</h3>
          </div>
          <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
            Earn 20% of your friends&apos; check-in tokens and points!
          </p>
          <div className="flex gap-2">
            <div className="flex-1 glass px-3 py-2 rounded-xl text-xs font-mono truncate">
              {profile.referralCode}
            </div>
            <Button size="sm" variant="glass" onClick={copyReferralLink}>
              {copied ? (
                <Check className="h-4 w-4" style={{ color: "#22C55E" }} />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {profileData?.stats?.referralCount > 0 && (
            <div className="mt-3 flex items-center justify-between text-xs">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>
                {profileData.stats.referralCount} referrals
              </span>
              <span className="font-bold" style={{ color: "hsl(var(--primary))" }}>
                +{formatNumber(profileData.stats.referralEarnings)} earned
              </span>
            </div>
          )}
        </Card>

        {/* Recent Games */}
        {profileData?.recentGames?.length > 0 && (
          <Card variant="glass">
            <h3 className="font-bold text-sm mb-3">Recent Games</h3>
            <div className="space-y-2">
              {profileData.recentGames.slice(0, 5).map((game: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <span className="capitalize">{game.gameId}</span>
                  <div className="flex items-center gap-3">
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>
                      Score: {game.score}
                    </span>
                    <Badge variant="primary">+{game.points} pts</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Chests */}
        {profileData?.recentChests?.length > 0 && (
          <Card variant="glass">
            <h3 className="font-bold text-sm mb-3">Recent Chests</h3>
            <div className="space-y-2">
              {profileData.recentChests.slice(0, 5).map((chest: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <span>
                    {chest.type === "premium" ? "🌟" : "🎁"}{" "}
                    {chest.type.charAt(0).toUpperCase() + chest.type.slice(1)}
                  </span>
                  <span className="font-bold">
                    {chest.rewardType === "points" && `⭐ ${chest.rewardAmount} pts`}
                    {chest.rewardType === "nft" && `🖼️ NFT`}
                    {chest.rewardType === "usdc" && `💰 $${chest.rewardAmount}`}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </motion.div>

      <ChestModal isOpen={showChest} onClose={() => setShowChest(false)} />
    </>
  );
}