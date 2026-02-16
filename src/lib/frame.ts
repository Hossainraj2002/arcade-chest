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

export async function composeCast(text: string, url?: string) {
  try {
    // composeCast is not available in the current SDK version
    // Consider using an alternative method or opening a URL instead
    if (url) {
      await openUrl(url);
    }
  } catch {
    // Not in frame context
  }
}

export { sdk };