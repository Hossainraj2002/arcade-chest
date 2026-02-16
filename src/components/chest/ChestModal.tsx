// src/components/chest/ChestModal.tsx

"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useChest } from "@/hooks/useChest";
import { useUserStore } from "@/stores/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { ECONOMY } from "@/lib/constants";

interface ChestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChestModal({ isOpen, onClose }: ChestModalProps) {
  const balance = useUserStore((s) => s.balance);
  const { openChest, loading, lastReward } = useChest();
  const [isOpening, setIsOpening] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const handleOpen = async (type: "free" | "premium") => {
    setIsOpening(true);
    setShowReward(false);

    // Chest opening animation delay
    await new Promise((r) => setTimeout(r, 1500));

    const result = await openChest(type);
    setIsOpening(false);

    if (result?.success) {
      setShowReward(true);
    }
  };

  const pendingChests = balance?.chestFreePending || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎁 Treasure Chest">
      <div className="flex flex-col items-center gap-4">
        {/* Chest animation */}
        <motion.div
          className="text-7xl"
          animate={
            isOpening
              ? {
                  rotate: [-5, 5, -5, 5, 0],
                  scale: [1, 1.1, 1, 1.1, 1.2],
                }
              : { scale: 1 }
          }
          transition={
            isOpening
              ? { duration: 1.5, ease: "easeInOut" }
              : { duration: 0.3 }
          }
        >
          {showReward ? "✨" : "🎁"}
        </motion.div>

        {/* Reward display */}
        <AnimatePresence>
          {showReward && lastReward && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm text-muted-foreground mb-1">You got:</p>
              <div className="text-2xl font-bold">
                {lastReward.type === "points" && (
                  <span className="gradient-text">
                    ⭐ {lastReward.amount} Points
                  </span>
                )}
                {lastReward.type === "nft" && (
                  <span className="text-purple-400">
                    🖼️ {lastReward.tier} NFT
                  </span>
                )}
                {lastReward.type === "usdc" && (
                  <span className="text-emerald-400">
                    💰 ${lastReward.amount} USDC
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status */}
        {!showReward && (
          <p className="text-sm text-muted-foreground">
            {pendingChests} chest{pendingChests !== 1 ? "s" : ""} available
          </p>
        )}

        {/* Buttons */}
        {!showReward && !isOpening && (
          <div className="flex gap-3 w-full">
            <Button
              className="flex-1"
              variant="glass"
              onClick={() => handleOpen("free")}
              disabled={pendingChests < 1}
              loading={loading}
            >
              Free Open
            </Button>
            <Button
              className="flex-1"
              variant="primary"
              onClick={() => handleOpen("premium")}
              disabled={pendingChests < 1}
              loading={loading}
            >
              Premium ({ECONOMY.PREMIUM_CHEST_PRICE_USDC} USDC)
            </Button>
          </div>
        )}

        {showReward && (
          <Button
            className="w-full"
            onClick={() => {
              setShowReward(false);
              if (pendingChests <= 1) onClose();
            }}
          >
            {pendingChests > 1 ? "Open Next" : "Close"}
          </Button>
        )}

        {isOpening && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Opening chest...
          </p>
        )}
      </div>
    </Modal>
  );
}