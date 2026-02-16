// src/app/page.tsx

"use client";

import { CheckInCard } from "@/components/home/CheckInCard";
import { TokenShop } from "@/components/home/TokenShop";
import { HighlightBanner } from "@/components/home/HighlightBanner";
import { PostGameModal } from "@/components/shared/PostGameModal";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <>
      <motion.div
        className="space-y-4 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <HighlightBanner />
        <CheckInCard />
        <TokenShop />

        <div className="glass-card p-4">
          <h3 className="font-bold text-sm mb-2">🎮 Quick Play</h3>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            Head to the Games tab to play Tetris, Bejeweled, Breakout, Puzzle
            Bobble, or Duck Hunt!
          </p>
        </div>
      </motion.div>

      <PostGameModal />
    </>
  );
}