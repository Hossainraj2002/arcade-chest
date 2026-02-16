// src/app/api/chest/open/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rollChest, type ChestType } from "@/lib/chest";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, chestType } = body;

    if (!wallet || !chestType) {
      return NextResponse.json(
        { error: "wallet and chestType required" },
        { status: 400 }
      );
    }

    if (chestType !== "free" && chestType !== "premium") {
      return NextResponse.json(
        { error: "Invalid chest type" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    const balance = await prisma.balance.findUnique({
      where: { wallet: normalizedWallet },
    });

    if (!balance) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has pending chests
    if (chestType === "free" && balance.chestFreePending < 1) {
      return NextResponse.json(
        { error: "No free chests available" },
        { status: 400 }
      );
    }

    if (chestType === "premium" && balance.chestFreePending < 1) {
      // Premium upgrades a free chest
      return NextResponse.json(
        { error: "No chests available to upgrade" },
        { status: 400 }
      );
    }

    // Roll the reward
    const reward = rollChest(chestType as ChestType);

    // Apply reward in transaction
    await prisma.$transaction(async (tx) => {
      // Deduct chest
      await tx.balance.update({
        where: { wallet: normalizedWallet },
        data: {
          chestFreePending: { decrement: 1 },
        },
      });

      // Apply reward
      if (reward.type === "points") {
        await tx.balance.update({
          where: { wallet: normalizedWallet },
          data: {
            pointsTotal: { increment: reward.amount },
            pointsSeason: { increment: reward.amount },
          },
        });
      } else if (reward.type === "usdc") {
        await tx.balance.update({
          where: { wallet: normalizedWallet },
          data: {
            usdcClaimable: { increment: reward.amount },
          },
        });
      }

      // Record chest open
      await tx.chestOpen.create({
        data: {
          wallet: normalizedWallet,
          type: chestType,
          openedAt: new Date(),
          rewardType: reward.type,
          rewardAmount: reward.amount,
        },
      });
    });

    return NextResponse.json({
      success: true,
      reward: {
        type: reward.type,
        amount: reward.amount,
        tier: reward.tier,
      },
    });
  } catch (error) {
    console.error("Chest open error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}