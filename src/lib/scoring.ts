// src/lib/scoring.ts

import { GAME_CONFIG, type GameId } from "./constants";

export interface RunSummary {
  rawScore: number;
  durationSeconds: number;
  levelReached?: number;
  linesCleared?: number;
  bricksDestroyed?: number;
  shotsUsed?: number;
  combos?: number;
  events?: Array<{ type: string; timestamp: number; data?: unknown }>;
}

export function validateRun(
  gameId: GameId,
  summary: RunSummary
): { valid: boolean; reason?: string } {
  const config = GAME_CONFIG[gameId];

  if (summary.durationSeconds < config.minDuration) {
    return { valid: false, reason: "Round too short" };
  }

  if (summary.durationSeconds > config.maxDuration + 30) {
    return { valid: false, reason: "Round too long" };
  }

  if (summary.rawScore < 0) {
    return { valid: false, reason: "Negative score" };
  }

  if (summary.rawScore > config.expectedTopScore * 2) {
    return { valid: false, reason: "Score exceeds maximum threshold" };
  }

  if (gameId === "tetris" && summary.linesCleared) {
    const maxLinesPerSecond = 2;
    if (summary.linesCleared > summary.durationSeconds * maxLinesPerSecond) {
      return { valid: false, reason: "Line clear rate too high" };
    }
  }

  if (gameId === "duck-hunt" && summary.shotsUsed !== undefined) {
    if (summary.rawScore > (summary.shotsUsed || 1) * 1000) {
      return { valid: false, reason: "Score per shot too high" };
    }
  }

  if (gameId === "breakout" && summary.bricksDestroyed !== undefined) {
    if (summary.bricksDestroyed > summary.durationSeconds * 5) {
      return { valid: false, reason: "Brick destroy rate too high" };
    }
  }

  return { valid: true };
}

export function calculatePoints(
  gameId: GameId,
  summary: RunSummary,
  streakBonus: number = 0
): { normalized: number; points: number; qualifiesForChest: boolean } {
  const config = GAME_CONFIG[gameId];

  const normalized = Math.min(
    Math.max(summary.rawScore / config.expectedTopScore, 0),
    1
  );

  const basePoints = Math.round(config.basePoints * normalized);
  const bonusMultiplier = 1 + streakBonus / 100;
  const points = Math.round(basePoints * bonusMultiplier);
  const qualifiesForChest = normalized >= config.chestThreshold;

  return { normalized, points, qualifiesForChest };
}