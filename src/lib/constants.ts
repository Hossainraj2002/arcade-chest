// src/lib/constants.ts

export const GAME_IDS = [
  "tetris",
  "bejeweled",
  "breakout",
  "puzzle-bobble",
  "duck-hunt",
] as const;

export type GameId = (typeof GAME_IDS)[number];

export const GAME_CONFIG: Record<
  GameId,
  {
    name: string;
    description: string;
    icon: string;
    color: string;
    gradient: string;
    expectedTopScore: number;
    basePoints: number;
    minDuration: number;
    maxDuration: number;
    chestThreshold: number;
  }
> = {
  tetris: {
    name: "Tetris",
    description: "Classic block puzzle",
    icon: "🧱",
    color: "#00D4FF",
    gradient: "from-cyan-500 to-blue-600",
    expectedTopScore: 50000,
    basePoints: 120,
    minDuration: 15,
    maxDuration: 600,
    chestThreshold: 0.7,
  },
  bejeweled: {
    name: "Bejeweled",
    description: "Match-3 gem game",
    icon: "💎",
    color: "#FF6B9D",
    gradient: "from-pink-500 to-rose-600",
    expectedTopScore: 30000,
    basePoints: 100,
    minDuration: 10,
    maxDuration: 300,
    chestThreshold: 0.7,
  },
  breakout: {
    name: "Breakout",
    description: "Break all the bricks",
    icon: "🏓",
    color: "#FFD93D",
    gradient: "from-yellow-400 to-orange-500",
    expectedTopScore: 20000,
    basePoints: 90,
    minDuration: 10,
    maxDuration: 300,
    chestThreshold: 0.7,
  },
  "puzzle-bobble": {
    name: "Puzzle Bobble",
    description: "Bubble shooter",
    icon: "🫧",
    color: "#6BCB77",
    gradient: "from-green-400 to-emerald-600",
    expectedTopScore: 25000,
    basePoints: 90,
    minDuration: 10,
    maxDuration: 300,
    chestThreshold: 0.7,
  },
  "duck-hunt": {
    name: "Duck Hunt",
    description: "Tap to shoot ducks",
    icon: "🦆",
    color: "#FF8C42",
    gradient: "from-orange-400 to-red-500",
    expectedTopScore: 15000,
    basePoints: 100,
    minDuration: 10,
    maxDuration: 120,
    chestThreshold: 0.7,
  },
};

export const ECONOMY = {
  DAILY_CHECKIN_TOKENS: 5,
  TOKEN_PURCHASE_AMOUNT: 10,
  TOKEN_PURCHASE_PRICE_USDC: 0.1,
  PREMIUM_CHEST_PRICE_USDC: 0.05,
  STREAK_BONUS_PERCENT: 10,
  STREAK_RESTORE_PRICE_USDC: 1,
  REFERRAL_PERCENT: 20,
  MAX_REFERRAL_EARNINGS_PER_DAY: 500,
} as const;

export const CHEST_LOOT_TABLE = {
  free: [
    { type: "points" as const, min: 10, max: 60, weight: 90 },
    { type: "points" as const, min: 60, max: 200, weight: 9 },
    { type: "nft" as const, tier: "common", weight: 1 },
  ],
  premium: [
    { type: "points" as const, min: 40, max: 240, weight: 80 },
    { type: "points" as const, min: 240, max: 800, weight: 15 },
    { type: "nft" as const, tier: "rare", weight: 4 },
    { type: "usdc" as const, min: 0.01, max: 0.1, weight: 1 },
  ],
} as const;

export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Builder code from base.dev
export const BUILDER_CODE =
  process.env.NEXT_PUBLIC_BUILDER_CODE || "";

// Contract addresses
export const CONTRACTS = {
  ACCESS_TOKEN: "" as `0x${string}`,
  CHECK_IN: "" as `0x${string}`,
  USDC_BASE:
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
  USDC_BASE_SEPOLIA:
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
};

// Treasury wallet - REPLACE WITH YOUR WALLET
export const TREASURY_WALLET =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;