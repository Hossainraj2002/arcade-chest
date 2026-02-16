// src/lib/chest.ts

import { CHEST_LOOT_TABLE } from "./constants";

export type ChestType = "free" | "premium";

export interface ChestReward {
  type: "points" | "nft" | "usdc";
  amount: number;
  tier?: string;
}

function weightedRandom(
  items: ReadonlyArray<{ weight: number } & Record<string, unknown>>
): number {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= items[i].weight;
    if (random <= 0) return i;
  }

  return items.length - 1;
}

export function rollChest(chestType: ChestType): ChestReward {
  const table = CHEST_LOOT_TABLE[chestType];
  const selectedIndex = weightedRandom(table);
  const selected = table[selectedIndex];

  if (selected.type === "points") {
    const entry = selected as { type: "points"; min: number; max: number; weight: number };
    const amount = Math.floor(
      Math.random() * (entry.max - entry.min + 1) + entry.min
    );
    return { type: "points", amount };
  }

  if (selected.type === "nft") {
    const entry = selected as { type: "nft"; tier: string; weight: number };
    return { type: "nft", amount: 1, tier: entry.tier };
  }

  if (selected.type === "usdc") {
    const entry = selected as { type: "usdc"; min: number; max: number; weight: number };
    const amount = parseFloat(
      (Math.random() * (entry.max - entry.min) + entry.min).toFixed(4)
    );
    return { type: "usdc", amount };
  }

  return { type: "points", amount: 10 };
}