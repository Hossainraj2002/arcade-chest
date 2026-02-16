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

interface FrameUserContext {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface FrameContextData {
  user?: FrameUserContext;
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

  useEffect(() => {
    const load = async () => {
      try {
        const ctx = await sdk.context;
        if (ctx) {
          setContext(ctx as unknown as FrameContextData);
          setIsInFrame(true);
        }
      } catch {
        setIsInFrame(false);
      }

      try {
        sdk.actions.ready();
      } catch {
        // Not in frame
      }

      setIsSDKLoaded(true);
    };

    if (!isSDKLoaded) {
      load();
    }
  }, [isSDKLoaded]);

  if (!isSDKLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-pulse text-4xl">🎮</div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading Arcade Chest...
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