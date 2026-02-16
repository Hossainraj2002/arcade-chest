// src/app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet")?.toLowerCase();

    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { wallet },
      include: {
        balance: true,
        streak: true,
        gameRuns: {
          where: { status: "accepted" },
          orderBy: { endedAt: "desc" },
          take: 20,
        },
        chestOpens: {
          orderBy: { openedAt: "desc" },
          take: 20,
        },
        referrals: {
          select: { wallet: true, displayName: true, pfpUrl: true, createdAt: true },
          take: 50,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Stats
    const totalGames = await prisma.gameRun.count({
      where: { wallet, status: "accepted" },
    });

    const totalChests = await prisma.chestOpen.count({
      where: { wallet },
    });

    const referralEarnings = await prisma.referralEarning.aggregate({
      where: { referrerWallet: wallet },
      _sum: { amount: true },
    });

    return NextResponse.json({
      profile: {
        wallet: user.wallet,
        displayName: user.displayName,
        pfpUrl: user.pfpUrl,
        fid: user.fid,
        referralCode: user.referralCode,
        createdAt: user.createdAt.toISOString(),
      },
      balance: user.balance,
      streak: user.streak,
      stats: {
        totalGames,
        totalChests,
        referralCount: user.referrals.length,
        referralEarnings: referralEarnings._sum.amount || 0,
      },
      recentGames: user.gameRuns.map((r) => ({
        gameId: r.gameId,
        score: r.validatedScore,
        points: r.pointsAwarded,
        playedAt: r.endedAt?.toISOString(),
      })),
      recentChests: user.chestOpens.map((c) => ({
        type: c.type,
        rewardType: c.rewardType,
        rewardAmount: c.rewardAmount,
        openedAt: c.openedAt?.toISOString(),
      })),
      referrals: user.referrals,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}