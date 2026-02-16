// src/app/api/round/end/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ECONOMY } from "@/lib/constants";
import type { GameId } from "@/lib/constants";
import { validateRun, calculatePoints, type RunSummary } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, roundId, runSummary } = body;

    if (!wallet || !roundId || !runSummary) {
      return NextResponse.json(
        { error: "wallet, roundId, and runSummary required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    // Find the active round
    const round = await prisma.gameRun.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    if (round.wallet !== normalizedWallet) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (round.status !== "active") {
      return NextResponse.json(
        { error: "Round already completed" },
        { status: 400 }
      );
    }

    const gameId = round.gameId as GameId;
    const summary: RunSummary = runSummary;

    // Validate
    const validation = validateRun(gameId, summary);

    if (!validation.valid) {
      await prisma.gameRun.update({
        where: { id: roundId },
        data: {
          status: "rejected",
          endedAt: new Date(),
          clientRunSummary: JSON.stringify(summary),
          validatedScore: 0,
          pointsAwarded: 0,
        },
      });

      return NextResponse.json({
        success: false,
        validatedScore: 0,
        pointsAwarded: 0,
        chestGranted: false,
        message: validation.reason || "Run rejected",
      });
    }

    // Get streak info for bonus
    const streak = await prisma.streak.findUnique({
      where: { wallet: normalizedWallet },
    });
    const streakBonus = streak
      ? streak.currentStreak * ECONOMY.STREAK_BONUS_PERCENT
      : 0;

    // Calculate points
    const { points, qualifiesForChest } = calculatePoints(
      gameId,
      summary,
      streakBonus
    );

    // Referral points
    const user = await prisma.user.findUnique({
      where: { wallet: normalizedWallet },
    });

    let referralPoints = 0;
    if (user?.referrerWallet) {
      referralPoints = Math.floor((points * ECONOMY.REFERRAL_PERCENT) / 100);
    }

    // Update everything in transaction
    await prisma.$transaction(async (tx) => {
      // Update round
      await tx.gameRun.update({
        where: { id: roundId },
        data: {
          status: "accepted",
          endedAt: new Date(),
          clientRunSummary: JSON.stringify(summary),
          validatedScore: summary.rawScore,
          pointsAwarded: points,
          chestGranted: qualifiesForChest,
        },
      });

      // Update player balance
      await tx.balance.update({
        where: { wallet: normalizedWallet },
        data: {
          pointsTotal: { increment: points },
          pointsSeason: { increment: points },
          chestFreePending: qualifiesForChest
            ? { increment: 1 }
            : undefined,
        },
      });

      // Referral bonus
      if (user?.referrerWallet && referralPoints > 0) {
        await tx.balance.update({
          where: { wallet: user.referrerWallet },
          data: {
            pointsTotal: { increment: referralPoints },
            pointsSeason: { increment: referralPoints },
          },
        });

        await tx.referralEarning.create({
          data: {
            referrerWallet: user.referrerWallet,
            referredWallet: normalizedWallet,
            source: "points",
            amount: referralPoints,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      validatedScore: summary.rawScore,
      pointsAwarded: points,
      chestGranted: qualifiesForChest,
      chestType: qualifiesForChest ? "free" : undefined,
    });
  } catch (error) {
    console.error("Round end error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}