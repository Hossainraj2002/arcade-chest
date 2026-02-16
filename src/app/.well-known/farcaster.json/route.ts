// src/app/.well-known/farcaster.json/route.ts

import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://basedgame.vercel.app";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header:
        "eyJmaWQiOjAsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIn0",
      payload: "eyJkb21haW4iOiJiYXNlZGdhbWUudmVyY2VsLmFwcCJ9",
      signature:
        "PLACEHOLDER_SIGN_AFTER_DEPLOY",
    },
    frame: {
      version: "1",
      name: "Arcade Chest",
      iconUrl: `${APP_URL}/icon.png`,
      homeUrl: APP_URL,
      imageUrl: `${APP_URL}/og-image.png`,
      buttonTitle: "Play Games",
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#13121d",
      webhookUrl: `${APP_URL}/api/webhook`,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}