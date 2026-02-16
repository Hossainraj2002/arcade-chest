// src/app/api/tokens/buy/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ECONOMY } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, txHash, amount } = body;

    if (!wallet || !txHash) {
      return NextResponse.json(
        { error: "wallet and txHash required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const tokensToAdd = amount || ECONOMY.TOKEN_PURCHASE_AMOUNT;

    // In production: verify the txHash on-chain before crediting
    // For MVP: trust the client (add verification later)

    await prisma.balance.update({
      where: { wallet: normalizedWallet },
      data: {
        accessTokensOffchain: { increment: tokensToAdd },
      },
    });

    return NextResponse.json({
      success: true,
      tokensAdded: tokensToAdd,
    });
  } catch (error) {
    console.error("Token buy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}