// src/app/api/checkin/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ECONOMY } from "@/lib/constants";
import { isToday, isYesterday } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet } = body;

    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    const normalizedWallet = wallet.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { wallet: normalizedWallet },
      include: { balance: true, streak: true },
    });

    if (!user || !user.balance || !user.streak) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already checked in today
    if (user.streak.lastCheckin && isToday(user.streak.lastCheckin)) {
      return NextResponse.json(
        { error: "Already checked in today" },
        { status: 400 }
      );
    }

    // Calculate streak
    const wasYesterday =
      user.streak.lastCheckin && isYesterday(user.streak.lastCheckin);
    const streakBroken =
      user.streak.lastCheckin !== null && !wasYesterday && !isToday(user.streak.lastCheckin);

    let newStreak: number;
    if (streakBroken) {
      newStreak = 1;
    } else {
      newStreak = (wasYesterday ? user.streak.currentStreak : 0) + 1;
    }

    // Calculate bonus
    const bonusPercent = (newStreak - 1) * ECONOMY.STREAK_BONUS_PERCENT;
    const bonusTokens = Math.floor(
      (ECONOMY.DAILY_CHECKIN_TOKENS * bonusPercent) / 100
    );
    const totalTokens = ECONOMY.DAILY_CHECKIN_TOKENS + bonusTokens;

    // Referrer reward
    let referralTokens = 0;
    if (user.referrerWallet) {
      referralTokens = Math.floor(
        (totalTokens * ECONOMY.REFERRAL_PERCENT) / 100
      );
    }

    // Transaction: update streak, balance, create checkin record, referral earning
    await prisma.$transaction(async (tx) => {
      // Update streak
      await tx.streak.update({
        where: { wallet: normalizedWallet },
        data: {
          currentStreak: newStreak,
          lastCheckin: new Date(),
          longestStreak: Math.max(user.streak!.longestStreak, newStreak),
        },
      });

      // Update balance
      await tx.balance.update({
        where: { wallet: normalizedWallet },
        data: {
          accessTokensOffchain: {
            increment: totalTokens,
          },
        },
      });

      // Create checkin record
      await tx.checkIn.create({
        data: {
          wallet: normalizedWallet,
          tokensGranted: totalTokens,
          streakDay: newStreak,
          bonusPercent,
        },
      });

      // Referral reward
      if (user.referrerWallet && referralTokens > 0) {
        await tx.balance.update({
          where: { wallet: user.referrerWallet },
          data: {
            accessTokensOffchain: { increment: referralTokens },
          },
        });

        await tx.referralEarning.create({
          data: {
            referrerWallet: user.referrerWallet,
            referredWallet: normalizedWallet,
            source: "checkin",
            amount: referralTokens,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      tokensGranted: totalTokens,
      streakDay: newStreak,
      bonusPercent,
      referralTokensAwarded: referralTokens,
    });
  } catch (error) {
    console.error("Checkin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}