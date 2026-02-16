// src/components/shared/PostGameModal.tsx

"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/stores/useGameStore";
import { motion } from "framer-motion";
import { Star, Gift, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChestModal } from "@/components/chest/ChestModal";

export function PostGameModal() {
  const { showPostGame, lastResult, currentGame, closePostGame } =
    useGameStore();
  const router = useRouter();
  const [showChest, setShowChest] = useState(false);

  if (!showPostGame || !lastResult) return null;

  return (
    <>
      <Modal isOpen={showPostGame} onClose={closePostGame} title="🎮 Round Complete">
        <div className="flex flex-col items-center gap-4">
          {/* Score */}
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Score</p>
            <p className="text-4xl font-bold gradient-text">
              {lastResult.validatedScore.toLocaleString()}
            </p>
          </motion.div>

          {/* Points earned */}
          <motion.div
            className="glass-card px-6 py-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="h-5 w-5 text-amber-400" />
              <span className="text-2xl font-bold">
                +{lastResult.pointsAwarded}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Points earned</p>
          </motion.div>

          {/* Chest earned */}
          {lastResult.chestGranted && (
            <motion.div
              className="glass-card px-6 py-3 text-center border-amber-500/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Gift className="h-6 w-6 text-amber-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-amber-400">
                Chest Earned! 🎁
              </p>
              <Button
                size="sm"
                variant="primary"
                className="mt-2"
                onClick={() => {
                  setShowChest(true);
                }}
              >
                Open Now
              </Button>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 w-full mt-2">
            <Button
              className="flex-1"
              variant="glass"
              onClick={() => {
                closePostGame();
                router.push("/games");
              }}
            >
              Games Hub
            </Button>
            <Button
              className="flex-1"
              variant="primary"
              onClick={() => {
                closePostGame();
                if (currentGame) {
                  router.push(`/games/${currentGame}`);
                }
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
          </div>
        </div>
      </Modal>

      <ChestModal isOpen={showChest} onClose={() => setShowChest(false)} />
    </>
  );
}