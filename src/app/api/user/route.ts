// src/app/api/user/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";
import { fetchUserByAddress } from "@/lib/neynar";
import { ECONOMY } from "@/lib/constants";
import { isToday, isYesterday } from "@/lib/utils";

/**
 * DEV + LOCAL SAFETY THROTTLE
 * Prevents UI loops from hammering /api/user and crashing Node/Prisma/Neynar.
 * - Only throttles repeated calls for the SAME wallet within a short window.
 * - For throttled calls, we return the current user state FAST (no Neynar fetch).
 *
 * NOTE:
 * In serverless, memory may not persist between invocations, but this still helps:
 * - local dev: 100% effective
 * - production: best-effort and reduces burst load when the same instance serves repeated calls
 */
const lastCallByWallet = new Map<string, number>();
const THROTTLE_MS = 2500;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, referralCode, fid } = body;

    if (!wallet || typeof wallet !== "string") {
      return NextResponse.json(
        { error: "wallet address required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    // ---- Throttle check (only for repeated calls) ----
    const now = Date.now();
    const last = lastCallByWallet.get(normalizedWallet) ?? 0;
    const isThrottled = now - last < THROTTLE_MS;

    // Always update last call timestamp early (prevents stampede)
    lastCallByWallet.set(normalizedWallet, now);

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { wallet: normalizedWallet },
      include: { balance: true, streak: true },
    });

    // If user exists and we are throttling, return quickly (skip Neynar update)
    if (user && isThrottled) {
      const streakInfo = getStreakInfo(user.streak);

      return NextResponse.json({
        profile: {
          wallet: user.wallet,
          displayName: user.displayName,
          pfpUrl: user.pfpUrl,
          fid: user.fid,
          referralCode: user.referralCode,
          createdAt: user.createdAt.toISOString(),
        },
        balance: user.balance
          ? {
              accessTokensOffchain: user.balance.accessTokensOffchain,
              pointsTotal: user.balance.pointsTotal,
              pointsSeason: user.balance.pointsSeason,
              chestFreePending: user.balance.chestFreePending,
              chestPremiumPending: user.balance.chestPremiumPending,
              usdcClaimable: user.balance.usdcClaimable,
            }
          : null,
        streak: streakInfo,
        throttled: true,
      });
    }

    if (user) {
      // Existing user - update Neynar data if we have fid
      // (Note: keep your existing behavior)
      if (fid && !user.fid) {
        const neynarUser = await fetchUserByAddress(normalizedWallet);
        if (neynarUser) {
          user = await prisma.user.update({
            where: { wallet: normalizedWallet },
            data: {
              fid: neynarUser.fid,
              displayName: neynarUser.display_name,
              pfpUrl: neynarUser.pfp_url,
            },
            include: { balance: true, streak: true },
          });
        }
      }

      const streakInfo = getStreakInfo(user.streak);

      return NextResponse.json({
        profile: {
          wallet: user.wallet,
          displayName: user.displayName,
          pfpUrl: user.pfpUrl,
          fid: user.fid,
          referralCode: user.referralCode,
          createdAt: user.createdAt.toISOString(),
        },
        balance: user.balance
          ? {
              accessTokensOffchain: user.balance.accessTokensOffchain,
              pointsTotal: user.balance.pointsTotal,
              pointsSeason: user.balance.pointsSeason,
              chestFreePending: user.balance.chestFreePending,
              chestPremiumPending: user.balance.chestPremiumPending,
              usdcClaimable: user.balance.usdcClaimable,
            }
          : null,
        streak: streakInfo,
      });
    }

    // New user creation
    let referrerWallet: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer && referrer.wallet !== normalizedWallet) {
        referrerWallet = referrer.wallet;
      }
    }

    // Fetch Neynar profile
    let displayName: string | null = null;
    let pfpUrl: string | null = null;
    let resolvedFid: number | null = fid || null;

    const neynarUser = await fetchUserByAddress(normalizedWallet);
    if (neynarUser) {
      displayName = neynarUser.display_name;
      pfpUrl = neynarUser.pfp_url;
      resolvedFid = neynarUser.fid;
    }

    const newCode = generateReferralCode();

    user = await prisma.user.create({
      data: {
        wallet: normalizedWallet,
        referrerWallet: referrerWallet,
        referralCode: newCode,
        displayName,
        pfpUrl,
        fid: resolvedFid,
        balance: {
          create: {
            accessTokensOffchain: 0,
            pointsTotal: 0,
            pointsSeason: 0,
            chestFreePending: 0,
            chestPremiumPending: 0,
            usdcClaimable: 0,
          },
        },
        streak: {
          create: {
            currentStreak: 0,
            longestStreak: 0,
          },
        },
      },
      include: { balance: true, streak: true },
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
      balance: {
        accessTokensOffchain: 0,
        pointsTotal: 0,
        pointsSeason: 0,
        chestFreePending: 0,
        chestPremiumPending: 0,
        usdcClaimable: 0,
      },
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckin: null,
        canCheckinToday: true,
        streakBonusPercent: 0,
        streakBroken: false,
      },
      isNew: true,
    });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getStreakInfo(
  streak: { currentStreak: number; lastCheckin: Date | null; longestStreak: number } | null
) {
  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckin: null,
      canCheckinToday: true,
      streakBonusPercent: 0,
      streakBroken: false,
    };
  }

  const canCheckinToday = !streak.lastCheckin || !isToday(streak.lastCheckin);
  const streakBroken =
    streak.lastCheckin !== null &&
    !isToday(streak.lastCheckin) &&
    !isYesterday(streak.lastCheckin) &&
    streak.currentStreak > 0;

  const streakBonusPercent = streakBroken
    ? 0
    : streak.currentStreak * ECONOMY.STREAK_BONUS_PERCENT;

  return {
    currentStreak: streakBroken ? 0 : streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastCheckin: streak.lastCheckin?.toISOString() || null,
    canCheckinToday,
    streakBonusPercent,
    streakBroken,
  };
}
