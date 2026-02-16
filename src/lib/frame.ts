// src/lib/frame.ts

import sdk from "@farcaster/frame-sdk";

export async function openUrl(url: string) {
  try {
    sdk.actions.openUrl(url);
  } catch {
    window.open(url, "_blank");
  }
}

export async function closeFrame() {
  try {
    sdk.actions.close();
  } catch {
    // Not in frame context
  }
}

export async function shareScore(text: string, url?: string) {
  // In frame SDK v0.0.26, composeCast is not available
  // Use openUrl to open Warpcast composer instead
  try {
    const encodedText = encodeURIComponent(text);
    const shareUrl = url
      ? `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodeURIComponent(url)}`
      : `https://warpcast.com/~/compose?text=${encodedText}`;
    sdk.actions.openUrl(shareUrl);
  } catch {
    // Fallback for standalone browser
    if (url) {
      window.open(url, "_blank");
    }
  }
}

export { sdk };