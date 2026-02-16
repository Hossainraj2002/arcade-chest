// src/app/api/leaderboard/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchUsersByFid } from "@/lib/neynar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "season";
    const wallet = searchParams.get("wallet")?.toLowerCase();
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 100);

    const orderField =
      type === "alltime" ? "pointsTotal" : "pointsSeason";

    // Get top players
    const topBalances = await prisma.balance.findMany({
      orderBy: { [orderField]: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            wallet: true,
            displayName: true,
            pfpUrl: true,
            fid: true,
          },
        },
      },
    });

    // Fetch Neynar data for users with FIDs
    const fids = topBalances
      .map((b) => b.user.fid)
      .filter((fid): fid is number => fid !== null);

    let neynarUsers: Record<number, { display_name: string; pfp_url: string }> = {};
    if (fids.length > 0) {
      const users = await fetchUsersByFid(fids);
      neynarUsers = Object.fromEntries(
        users.map((u) => [u.fid, { display_name: u.display_name, pfp_url: u.pfp_url }])
      );
    }

    const entries = topBalances.map((b, index) => {
      const neynar = b.user.fid ? neynarUsers[b.user.fid] : null;
      return {
        rank: index + 1,
        wallet: b.user.wallet,
        displayName: neynar?.display_name || b.user.displayName,
        pfpUrl: neynar?.pfp_url || b.user.pfpUrl,
        points: type === "alltime" ? b.pointsTotal : b.pointsSeason,
        fid: b.user.fid,
      };
    });

    // Get requesting user's rank
    let myRank: number | null = null;
    let myPoints: number | null = null;

    if (wallet) {
      const myBalance = await prisma.balance.findUnique({
        where: { wallet },
      });

      if (myBalance) {
        myPoints =
          type === "alltime"
            ? myBalance.pointsTotal
            : myBalance.pointsSeason;

        const aboveMe = await prisma.balance.count({
          where: {
            [orderField]: { gt: myPoints },
          },
        });

        myRank = aboveMe + 1;
      }
    }

    const total = await prisma.balance.count();

    return NextResponse.json({
      entries,
      myRank,
      myPoints,
      total,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}