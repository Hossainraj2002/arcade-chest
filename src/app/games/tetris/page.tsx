// src/app/games/tetris/page.tsx

"use client";

import { GameWrapper } from "@/components/games/GameWrapper";
import { TetrisGame } from "@/game-engines/tetris/TetrisGame";

export default function TetrisPage() {
  return (
    <GameWrapper gameId="tetris">
      {({ onGameEnd, isPlaying, nonce }) => (
        <TetrisGame
          onGameEnd={onGameEnd}
          isPlaying={isPlaying}
          nonce={nonce}
        />
      )}
    </GameWrapper>
  );
}