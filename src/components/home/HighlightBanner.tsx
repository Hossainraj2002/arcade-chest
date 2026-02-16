// src/components/home/HighlightBanner.tsx

"use client";

import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

export function HighlightBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card variant="glow" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-pink-500/10 to-amber-500/10" />
        <div className="relative z-10 text-center py-2">
          <p className="text-xs text-muted-foreground mb-1">🏆 Season 1</p>
          <h2 className="text-lg font-bold gradient-text mb-1">
            Play → Earn → Win
          </h2>
          <p className="text-xs text-muted-foreground">
            Top players share the reward pool. Open chests for NFTs & USDC.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}