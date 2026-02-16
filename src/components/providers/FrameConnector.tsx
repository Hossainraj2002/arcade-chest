// src/components/providers/FrameConnector.tsx

"use client";

import { useEffect } from "react";
import { useConnect } from "wagmi";
import { useFrame } from "./FrameProvider";

export function FrameAutoConnect() {
  const { isInFrame } = useFrame();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (isInFrame) {
      // Try to auto-connect with the first available connector
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    }
  }, [isInFrame, connect, connectors]);

  return null;
}