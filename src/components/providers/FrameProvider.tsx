// src/components/providers/FrameProvider.tsx

"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import sdk from "@farcaster/frame-sdk";
import { useConnect } from "wagmi";

interface FrameUser {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface FrameContextData {
  user?: FrameUser;
  location?: unknown;
  client?: unknown;
  [key: string]: unknown;
}

interface FrameContextValue {
  context: FrameContextData | null;
  isSDKLoaded: boolean;
  isInFrame: boolean;
}

const FrameCtx = createContext<FrameContextValue>({
  context: null,
  isSDKLoaded: false,
  isInFrame: false,
});

export function useFrame() {
  return useContext(FrameCtx);
}

export function FrameProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<FrameContextData | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const { connect, connectors } = useConnect();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const ctx = await sdk.context;
        if (ctx && mounted) {
          setContext(ctx as unknown as FrameContextData);
          setIsInFrame(true);
          // Auto-connect using frame connector
          const fc = connectors.find((c) => c.id === "farcasterFrame");
          if (fc) connect({ connector: fc });
        }
      } catch {
        // Not in a frame — standalone browser
      }

      // Signal readiness to the host app (Base / Warpcast)
      try {
        sdk.actions.ready();
      } catch {
        // Swallow — not in a frame
      }

      if (mounted) setIsSDKLoaded(true);
    };

    load();
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isSDKLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-pulse text-5xl">🎮</div>
          <p className="text-sm animate-pulse" style={{ color: "var(--muted-fg)" }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return (
    <FrameCtx.Provider value={{ context, isSDKLoaded, isInFrame }}>
      {children}
    </FrameCtx.Provider>
  );
}