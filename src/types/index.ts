// src/types/index.ts

import type { GameId } from "@/lib/constants";

export interface UserProfile {
  wallet: string;
  displayName: string | null;
  pfpUrl: string | null;
  fid: number | null;
  referralCode: string;
  createdAt: string;
}

export interface UserBalance {
  accessTokensOffchain: number;
  pointsTotal: number;
  pointsSeason: number;
  chestFreePending: number;
  chestPremiumPending: number;
  usdcClaimable: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCheckin: string | null;
  canCheckinToday: boolean;
  streakBonusPercent: number;
  streakBroken: boolean;
}

export interface GameCard {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

export interface RoundStartResponse {
  roundId: string;
  nonce: string;
  gameId: GameId;
}

export interface RoundEndRequest {
  roundId: string;
  runSummary: {
    rawScore: number;
    durationSeconds: number;
    levelReached?: number;
    linesCleared?: number;
    bricksDestroyed?: number;
    shotsUsed?: number;
    combos?: number;
  };
}

export interface RoundEndResponse {
  success: boolean;
  validatedScore: number;
  pointsAwarded: number;
  chestGranted: boolean;
  chestType?: "free";
  message?: string;
}

export interface ChestOpenResponse {
  success: boolean;
  reward: {
    type: "points" | "nft" | "usdc";
    amount: number;
    tier?: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  displayName: string | null;
  pfpUrl: string | null;
  points: number;
  fid: number | null;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  myRank: number | null;
  myPoints: number | null;
  total: number;
}

export type ThemeMode = "light" | "dark";