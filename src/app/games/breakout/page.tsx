// src/app/games/breakout/page.tsx

"use client";

import { GameWrapper } from "@/components/games/GameWrapper";
import { BreakoutGame } from "@/game-engines/breakout/BreakoutGame";

export default function BreakoutPage() {
  return (
    <GameWrapper gameId="breakout">
      {({ onGameEnd, isPlaying, nonce }) => (
        <BreakoutGame
          onGameEnd={onGameEnd}
          isPlaying={isPlaying}
          nonce={nonce}
        />
      )}
    </GameWrapper>
  );
}