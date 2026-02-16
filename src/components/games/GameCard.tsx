// src/components/games/GameCard.tsx

"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { GAME_CONFIG, type GameId } from "@/lib/constants";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface GameCardProps {
  gameId: GameId;
  index: number;
}

export function GameCard({ gameId, index }: GameCardProps) {
  const router = useRouter();
  const config = GAME_CONFIG[gameId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        variant="glass"
        className="cursor-pointer group hover:scale-[1.02] transition-transform active:scale-[0.98]"
        onClick={() => router.push(`/games/${gameId}`)}
      >
        <div className="flex items-center gap-4">
          {/* Game icon */}
          <div
            className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl shadow-lg`}
          >
            {config.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">{config.name}</h3>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Up to {config.basePoints} pts/round
            </p>
          </div>

          {/* Play button */}
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Play className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}