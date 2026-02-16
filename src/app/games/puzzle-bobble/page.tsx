// src/app/games/puzzle-bobble/page.tsx

"use client";

import { GameWrapper } from "@/components/games/GameWrapper";
import { PuzzleBobbleGame } from "@/game-engines/puzzle-bobble/PuzzleBobbleGame";

export default function PuzzleBobblePage() {
  return (
    <GameWrapper gameId="puzzle-bobble">
      {({ onGameEnd, isPlaying, nonce }) => (
        <PuzzleBobbleGame
          onGameEnd={onGameEnd}
          isPlaying={isPlaying}
          nonce={nonce}
        />
      )}
    </GameWrapper>
  );
}