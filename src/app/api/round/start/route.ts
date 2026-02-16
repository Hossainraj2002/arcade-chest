// src/app/api/round/start/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GAME_IDS, type GameId } from "@/lib/constants";
import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, gameId } = body;

    if (!wallet || !gameId) {
      return NextResponse.json(
        { error: "wallet and gameId required" },
        { status: 400 }
      );
    }

    if (!GAME_IDS.includes(gameId as GameId)) {
      return NextResponse.json(
        { error: "Invalid gameId" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    const balance = await prisma.balance.findUnique({
      where: { wallet: normalizedWallet },
    });

    if (!balance || balance.accessTokensOffchain < 1) {
      return NextResponse.json(
        { error: "Not enough access tokens" },
        { status: 400 }
      );
    }

    // Check no active round
    const activeRound = await prisma.gameRun.findFirst({
      where: {
        wallet: normalizedWallet,
        status: "active",
      },
    });

    if (activeRound) {
      // Auto-expire old round
      await prisma.gameRun.update({
        where: { id: activeRound.id },
        data: { status: "expired", endedAt: new Date() },
      });
    }

    const roundId = uuid();
    const nonce = nanoid(32);

    // Deduct token and create round
    await prisma.$transaction(async (tx) => {
      await tx.balance.update({
        where: { wallet: normalizedWallet },
        data: { accessTokensOffchain: { decrement: 1 } },
      });

      await tx.gameRun.create({
        data: {
          id: roundId,
          wallet: normalizedWallet,
          gameId,
          nonce,
          status: "active",
        },
      });
    });

    return NextResponse.json({
      roundId,
      nonce,
      gameId,
    });
  } catch (error) {
    console.error("Round start error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}